package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"sort"
)

// GetRevenueByYear returns monthly revenue breakdown for a given year.
func GetRevenueByYear(year int) ([]models.RevenueMonthData, error) {
	months := make(map[string]*models.RevenueMonthData)
	for m := 1; m <= 12; m++ {
		key := fmt.Sprintf("%04d-%02d", year, m)
		months[key] = &models.RevenueMonthData{Month: key}
	}

	// --- Subscriptions ---
	subQuery := `
		SELECT
			TO_CHAR(DATE_TRUNC('month', s.sub_from), 'YYYY-MM') AS month,
			COUNT(*) * COALESCE((SELECT value FROM finance_settings WHERE key = 'subscription_price' LIMIT 1), 0) AS revenue
		FROM subscriptions s
		WHERE EXTRACT(YEAR FROM s.sub_from) = $1
		GROUP BY DATE_TRUNC('month', s.sub_from)
	`
	if err := fillRevenue(subQuery, year, months, func(row *models.RevenueMonthData, v float64) {
		row.Subscriptions = v
	}); err != nil {
		return nil, fmt.Errorf("error getting subscriptions revenue from DB: %v", err)
	}

	// --- Commissions ---
	commQuery := `
		SELECT
			TO_CHAR(DATE_TRUNC('month', t.created_at), 'YYYY-MM') AS month,
			COALESCE(SUM(i.price * (SELECT value FROM finance_settings WHERE key = 'commission_rate' LIMIT 1) / 100), 0) AS revenue
		FROM transactions t
		JOIN items i ON t.id_item = i.id
		WHERE t.action = 'purchased'
		  AND EXTRACT(YEAR FROM t.created_at) = $1
		GROUP BY DATE_TRUNC('month', t.created_at)
	`
	if err := fillRevenue(commQuery, year, months, func(row *models.RevenueMonthData, v float64) {
		row.Commissions = v
	}); err != nil {
		return nil, fmt.Errorf("error getting commissions revenue from DB: %v", err)
	}

	// --- Ads ---
	adsQuery := `
		SELECT
			TO_CHAR(DATE_TRUNC('month', a.start_date), 'YYYY-MM') AS month,
			COUNT(*) * COALESCE((SELECT value FROM finance_settings WHERE key = 'ads_price_per_month' LIMIT 1), 0) AS revenue
		FROM ads a
		WHERE a.status = 'active'
		  AND EXTRACT(YEAR FROM a.start_date) = $1
		GROUP BY DATE_TRUNC('month', a.start_date)
	`
	if err := fillRevenue(adsQuery, year, months, func(row *models.RevenueMonthData, v float64) {
		row.Ads = v
	}); err != nil {
		return nil, fmt.Errorf("error getting ads revenue from DB: %v", err)
	}

	// --- Events ---
	eventsQuery := `
		SELECT
			TO_CHAR(DATE_TRUNC('month', e.start_at), 'YYYY-MM') AS month,
			COALESCE(SUM(e.price), 0) AS revenue
		FROM event_registrations er
		JOIN events e ON er.id_event = e.id
		WHERE e.price IS NOT NULL
		  AND e.price > 0
		  AND EXTRACT(YEAR FROM e.start_at) = $1
		GROUP BY DATE_TRUNC('month', e.start_at)
	`
	if err := fillRevenue(eventsQuery, year, months, func(row *models.RevenueMonthData, v float64) {
		row.Events = v
	}); err != nil {
		return nil, fmt.Errorf("error getting events revenue from DB: %v", err)
	}

	result := make([]models.RevenueMonthData, 0, 12)
	for m := 1; m <= 12; m++ {
		key := fmt.Sprintf("%04d-%02d", year, m)
		result = append(result, *months[key])
	}
	return result, nil
}

// fillRevenue is a helper that runs a revenue query and applies the value to the months map.
func fillRevenue(query string, year int, months map[string]*models.RevenueMonthData, setter func(*models.RevenueMonthData, float64)) error {
	rows, err := utils.Conn.Query(query, year)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var month string
		var revenue float64
		if err := rows.Scan(&month, &revenue); err != nil {
			return err
		}
		if entry, ok := months[month]; ok {
			setter(entry, revenue)
		}
	}
	return rows.Err()
}

// invoiceStats holds raw aggregated counts and item totals per account.
type invoiceStats struct {
	txCount    int
	txTotal    float64 // sum of item prices (before commission)
	subCount   int
	adsCount   int
	evtCount   int
	evtTotal   float64 // sum of event prices
}

// getInvoiceStatsPerAccount runs 4 simple queries (one per invoice type) and
// returns a map of account_id → invoiceStats.
func getInvoiceStatsPerAccount() (map[int]*invoiceStats, error) {
	result := map[int]*invoiceStats{}

	ensure := func(id int) *invoiceStats {
		if result[id] == nil {
			result[id] = &invoiceStats{}
		}
		return result[id]
	}

	// 1. Transactions
	rows, err := utils.Conn.Query(`
		SELECT t.id_pro, COUNT(*), COALESCE(SUM(i.price), 0)
		FROM transactions t
		JOIN items i ON i.id = t.id_item
		WHERE t.action = 'purchased'
		GROUP BY t.id_pro
	`)
	if err != nil {
		return nil, fmt.Errorf("error getting transaction stats from DB: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var cnt int
		var total float64
		if err := rows.Scan(&id, &cnt, &total); err != nil {
			return nil, fmt.Errorf("error scanning transaction stats from DB: %v", err)
		}
		s := ensure(id)
		s.txCount = cnt
		s.txTotal = total
	}

	// 2. Subscriptions
	rows2, err := utils.Conn.Query(`
		SELECT id_pro, COUNT(*)
		FROM subscriptions
		GROUP BY id_pro
	`)
	if err != nil {
		return nil, fmt.Errorf("error getting subscription stats from DB: %v", err)
	}
	defer rows2.Close()
	for rows2.Next() {
		var id, cnt int
		if err := rows2.Scan(&id, &cnt); err != nil {
			return nil, fmt.Errorf("error scanning subscription stats from DB: %v", err)
		}
		ensure(id).subCount = cnt
	}

	// 3. Ads
	rows3, err := utils.Conn.Query(`
		SELECT po.id_account, COUNT(*)
		FROM ads a
		JOIN posts po ON po.id = a.id_post
		WHERE a.status != 'cancelled'
		GROUP BY po.id_account
	`)
	if err != nil {
		return nil, fmt.Errorf("error getting ads stats from DB: %v", err)
	}
	defer rows3.Close()
	for rows3.Next() {
		var id, cnt int
		if err := rows3.Scan(&id, &cnt); err != nil {
			return nil, fmt.Errorf("error scanning ads stats from DB: %v", err)
		}
		ensure(id).adsCount = cnt
	}

	// 4. Events
	rows4, err := utils.Conn.Query(`
		SELECT er.id_account, COUNT(*), COALESCE(SUM(ev.price), 0)
		FROM event_registrations er
		JOIN events ev ON ev.id = er.id_event
		WHERE ev.price IS NOT NULL AND ev.price > 0 AND er.status != 'cancelled'
		GROUP BY er.id_account
	`)
	if err != nil {
		return nil, fmt.Errorf("error getting event stats from DB: %v", err)
	}
	defer rows4.Close()
	for rows4.Next() {
		var id int
		var cnt int
		var total float64
		if err := rows4.Scan(&id, &cnt, &total); err != nil {
			return nil, fmt.Errorf("error scanning event stats from DB: %v", err)
		}
		s := ensure(id)
		s.evtCount = cnt
		s.evtTotal = total
	}

	return result, nil
}

// GetInvoiceUsers returns a paginated list of accounts ordered by invoice count,
// with total spending computed across all invoice types.
func GetInvoiceUsers(page, limit int, search string) ([]models.InvoiceUser, int, error) {
	offset := (page - 1) * limit
	searchLike := "%" + search + "%"

	// Fetch rates and per-account stats upfront.
	settings, err := GetAllFinanceSettings()
	if err != nil {
		return nil, 0, fmt.Errorf("error fetching finance settings: %v", err)
	}
	rates := map[string]float64{}
	for _, s := range settings {
		rates[s.Key] = s.Value
	}

	stats, err := getInvoiceStatsPerAccount()
	if err != nil {
		return nil, 0, err
	}

	// Paginated accounts query — ordering by total invoice count.
	accountQuery := `
		SELECT a.id, a.username, a.email, a.role, a.created_at
		FROM accounts a
		WHERE a.deleted_at IS NULL
		  AND ($3 = '' OR a.username ILIKE $3 OR a.email ILIKE $3)
		ORDER BY a.created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := utils.Conn.Query(accountQuery, limit, offset, searchLike)
	if err != nil {
		return nil, 0, fmt.Errorf("error getting invoice users from DB: %v", err)
	}
	defer rows.Close()

	var users []models.InvoiceUser
	for rows.Next() {
		var u models.InvoiceUser
		if err := rows.Scan(&u.IDAccount, &u.Username, &u.Email, &u.Role, &u.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("error scanning invoice user row from DB: %v", err)
		}
		if s, ok := stats[u.IDAccount]; ok {
			u.TransactionCount = s.txCount + s.subCount + s.adsCount + s.evtCount
			u.TotalSpent = s.txTotal*(1+rates["commission_rate"]/100) +
				float64(s.subCount)*rates["subscription_price"] +
				float64(s.adsCount)*rates["ads_price_per_month"] +
				s.evtTotal
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating invoice users rows from DB: %v", err)
	}

	var total int
	if err := utils.Conn.QueryRow(`
		SELECT COUNT(DISTINCT a.id)
		FROM accounts a
		WHERE a.deleted_at IS NULL
		  AND ($1 = '' OR a.username ILIKE $1 OR a.email ILIKE $1)
	`, searchLike).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("error counting invoice users from DB: %v", err)
	}

	return users, total, nil
}

// GetUserInvoices returns all invoices for a given account across all types:
// transactions (purchased items), subscriptions, ads, and paid event registrations.
func GetUserInvoices(accountID int) (models.UserInvoicesResponse, error) {
	var resp models.UserInvoicesResponse

	err := utils.Conn.QueryRow(
		`SELECT id, username, email FROM accounts WHERE id = $1 AND deleted_at IS NULL`,
		accountID,
	).Scan(&resp.IDAccount, &resp.Username, &resp.Email)
	if err == sql.ErrNoRows {
		return resp, fmt.Errorf("account not found")
	}
	if err != nil {
		return resp, fmt.Errorf("error getting account info from DB: %v", err)
	}

	var invoices []models.UserInvoice

	transactionInvoices, err := getTransactionInvoices(accountID)
	if err != nil {
		return resp, err
	}
	invoices = append(invoices, transactionInvoices...)

	subscriptionInvoices, err := getSubscriptionInvoices(accountID)
	if err != nil {
		return resp, err
	}
	invoices = append(invoices, subscriptionInvoices...)

	adInvoices, err := getAdInvoices(accountID)
	if err != nil {
		return resp, err
	}
	invoices = append(invoices, adInvoices...)

	eventInvoices, err := getEventInvoices(accountID)
	if err != nil {
		return resp, err
	}
	invoices = append(invoices, eventInvoices...)

	sort.Slice(invoices, func(i, j int) bool {
		return invoices[i].CreatedAt.After(invoices[j].CreatedAt)
	})

	resp.Invoices = invoices
	resp.Total = len(invoices)
	return resp, nil
}

// getTransactionInvoices returns purchased item invoices for a pro account.
func getTransactionInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			t.id,
			t.created_at,
			t.id_transaction::text,
			i.title,
			i.price,
			ROUND(i.price * COALESCE((SELECT value FROM finance_settings WHERE key = 'commission_rate' LIMIT 1), 0) / 100, 2) AS commission,
			ROUND(i.price * (1 + COALESCE((SELECT value FROM finance_settings WHERE key = 'commission_rate' LIMIT 1), 0) / 100), 2) AS total
		FROM transactions t
		JOIN items i ON i.id = t.id_item
		WHERE t.id_pro = $1 AND t.action = 'purchased'
	`
	rows, err := utils.Conn.Query(query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error getting transaction invoices from DB: %v", err)
	}
	defer rows.Close()

	var result []models.UserInvoice
	for rows.Next() {
		var inv models.UserInvoice
		var idTx string
		var itemTitle string
		var itemPrice, commission float64

		inv.Type = "transaction"
		if err := rows.Scan(&inv.ID, &inv.CreatedAt, &idTx, &itemTitle, &itemPrice, &commission, &inv.Amount); err != nil {
			return nil, fmt.Errorf("error scanning transaction invoice row from DB: %v", err)
		}
		inv.IDTransaction = &idTx
		inv.ItemTitle = &itemTitle
		inv.ItemPrice = &itemPrice
		inv.Commission = &commission
		result = append(result, inv)
	}
	return result, rows.Err()
}

// getSubscriptionInvoices returns subscription invoices for a pro account.
func getSubscriptionInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			s.id,
			s.sub_from,
			s.sub_to,
			COALESCE((SELECT value FROM finance_settings WHERE key = 'subscription_price' LIMIT 1), 0) AS amount
		FROM subscriptions s
		WHERE s.id_pro = $1
	`
	rows, err := utils.Conn.Query(query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error getting subscription invoices from DB: %v", err)
	}
	defer rows.Close()

	var result []models.UserInvoice
	for rows.Next() {
		var inv models.UserInvoice
		var subFrom, subTo sql.NullTime

		inv.Type = "subscription"
		if err := rows.Scan(&inv.ID, &subFrom, &subTo, &inv.Amount); err != nil {
			return nil, fmt.Errorf("error scanning subscription invoice row from DB: %v", err)
		}
		if subFrom.Valid {
			inv.CreatedAt = subFrom.Time
			inv.SubFrom = &subFrom.Time
		}
		if subTo.Valid {
			inv.SubTo = &subTo.Time
		}
		result = append(result, inv)
	}
	return result, rows.Err()
}

// getAdInvoices returns ad invoices for an account (non-cancelled ads on their posts).
func getAdInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			a.id_ads,
			a.start_date::timestamptz,
			a.end_date::timestamptz,
			p.id,
			p.title,
			COALESCE((SELECT value FROM finance_settings WHERE key = 'ads_price_per_month' LIMIT 1), 0) AS amount
		FROM ads a
		JOIN posts p ON p.id = a.id_post
		WHERE p.id_account = $1 AND a.status != 'cancelled'
	`
	rows, err := utils.Conn.Query(query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error getting ad invoices from DB: %v", err)
	}
	defer rows.Close()

	var result []models.UserInvoice
	for rows.Next() {
		var inv models.UserInvoice
		var startDate, endDate sql.NullTime
		var postID int
		var postTitle string

		inv.Type = "ad"
		if err := rows.Scan(&inv.ID, &startDate, &endDate, &postID, &postTitle, &inv.Amount); err != nil {
			return nil, fmt.Errorf("error scanning ad invoice row from DB: %v", err)
		}
		if startDate.Valid {
			inv.CreatedAt = startDate.Time
			inv.AdStartDate = &startDate.Time
		}
		if endDate.Valid {
			inv.AdEndDate = &endDate.Time
		}
		inv.PostID = &postID
		inv.PostTitle = &postTitle
		result = append(result, inv)
	}
	return result, rows.Err()
}

// getEventInvoices returns paid event registration invoices for an account.
func getEventInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			e.id,
			er.created_at,
			e.price,
			e.title
		FROM event_registrations er
		JOIN events e ON e.id = er.id_event
		WHERE er.id_account = $1
		  AND e.price IS NOT NULL
		  AND e.price > 0
		  AND er.status != 'cancelled'
	`
	rows, err := utils.Conn.Query(query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error getting event invoices from DB: %v", err)
	}
	defer rows.Close()

	var result []models.UserInvoice
	for rows.Next() {
		var inv models.UserInvoice
		var eventTitle string

		inv.Type = "event"
		if err := rows.Scan(&inv.ID, &inv.CreatedAt, &inv.Amount, &eventTitle); err != nil {
			return nil, fmt.Errorf("error scanning event invoice row from DB: %v", err)
		}
		inv.EventID = &inv.ID
		inv.EventTitle = &eventTitle
		result = append(result, inv)
	}
	return result, rows.Err()
}
