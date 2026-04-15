package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"slices"
	"sort"
)

var allowedFinanceKeys = []string{"ads_price_per_month", "subscription_price", "trial_days", "commission_rate"}

func GetFinanceSettingByKey(key string) (int, error) {
	var price int

	if !slices.Contains(allowedFinanceKeys, key) {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: invalid key '%v'", key)
	}

	row := utils.Conn.QueryRow("SELECT value FROM finance_settings WHERE key=$1", key)
	if err := row.Scan(&price); err != nil {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: %v", err.Error())
	}
	return price, nil
}

// GetAllFinanceSettings returns all finance settings.
func GetAllFinanceSettings() ([]models.FinanceSetting, error) {
	rows, err := utils.Conn.Query("SELECT key::text, value, updated_at FROM finance_settings ORDER BY key")
	if err != nil {
		return nil, fmt.Errorf("error getting finance settings from DB: %v", err)
	}
	defer rows.Close()

	var settings []models.FinanceSetting
	for rows.Next() {
		var s models.FinanceSetting
		if err := rows.Scan(&s.Key, &s.Value, &s.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning finance setting row from DB: %v", err)
		}
		settings = append(settings, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating finance settings rows from DB: %v", err)
	}
	return settings, nil
}

// UpdateFinanceSetting updates the value of a finance setting and returns the old value.
func UpdateFinanceSetting(key string, value float64) (float64, error) {
	if !slices.Contains(allowedFinanceKeys, key) {
		return 0, fmt.Errorf("invalid key '%v'", key)
	}

	var oldValue float64
	err := utils.Conn.QueryRow("SELECT value FROM finance_settings WHERE key = $1", key).Scan(&oldValue)
	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("setting not found")
	}
	if err != nil {
		return 0, fmt.Errorf("error getting old finance setting from DB: %v", err)
	}

	_, err = utils.Conn.Exec(
		"UPDATE finance_settings SET value = $1, updated_at = now() WHERE key = $2",
		value, key,
	)
	if err != nil {
		return 0, fmt.Errorf("error updating finance setting in DB: %v", err)
	}

	return oldValue, nil
}

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
			COALESCE(SUM(s.price), 0) AS revenue
		FROM subscriptions s
		WHERE EXTRACT(YEAR FROM s.sub_from) = $1
		GROUP BY DATE_TRUNC('month', s.sub_from)
	`
	if err := fillRevenue(subQuery, year, months, func(row *models.RevenueMonthData, v float64) {
		row.Subscriptions = v
	}); err != nil {
		return nil, fmt.Errorf("error getting subscriptions revenue from DB: %v", err)
	}

	// --- Commissions (uses snapshot prices stored in transactions) ---
	commQuery := `
		SELECT
			TO_CHAR(DATE_TRUNC('month', t.created_at), 'YYYY-MM') AS month,
			COALESCE(SUM(t.total_price - t.item_price), 0) AS revenue
		FROM transactions t
		WHERE t.action = 'purchased'
		  AND t.total_price IS NOT NULL AND t.item_price IS NOT NULL
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
			COALESCE(SUM(a.total_price), 0) AS revenue
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
			TO_CHAR(DATE_TRUNC('month', er.created_at), 'YYYY-MM') AS month,
			COALESCE(SUM(er.paid_price), 0) AS revenue
		FROM event_registrations er
		WHERE er.paid_price IS NOT NULL
		  AND er.paid_price > 0
		  AND EXTRACT(YEAR FROM er.created_at) = $1
		GROUP BY DATE_TRUNC('month', er.created_at)
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

// getInvoiceStatsPerAccount was removed because stats aggregation is now done natively in SQL via CTE inside GetInvoiceUsers.

// GetInvoiceUsers returns a paginated list of accounts ordered by sort criteria,
// with total spending computed across all invoice types.
func GetInvoiceUsers(page, limit int, search, sortType string) ([]models.InvoiceUser, int, error) {
	offset := (page - 1) * limit
	searchLike := "%" + search + "%"

	orderClause := "ORDER BY a.created_at DESC"
	if sortType == "most_spending" {
		orderClause = "ORDER BY total_spent DESC NULLS LAST"
	} else if sortType == "least_spending" {
		orderClause = "ORDER BY total_spent ASC NULLS FIRST"
	} else if sortType == "most_invoices" {
		orderClause = "ORDER BY transaction_count DESC NULLS LAST"
	} else if sortType == "least_invoices" {
		orderClause = "ORDER BY transaction_count ASC NULLS FIRST"
	}

	// Paginated accounts query.
	accountQuery := fmt.Sprintf(`
		WITH stats AS (
			SELECT id_pro AS account_id, COUNT(*) as cnt, COALESCE(SUM(total_price), 0) as amt
			FROM transactions
			WHERE action = 'purchased' AND total_price IS NOT NULL
			GROUP BY id_pro
			UNION ALL
			SELECT id_pro, COUNT(*), COALESCE(SUM(price), 0)
			FROM subscriptions
			GROUP BY id_pro
			UNION ALL
			SELECT po.id_account, COUNT(*), COALESCE(SUM(a.total_price), 0)
			FROM ads a
			JOIN posts po ON po.id = a.id_post
			GROUP BY po.id_account
			UNION ALL
			SELECT er.id_account, COUNT(*), COALESCE(SUM(er.paid_price), 0)
			FROM event_registrations er
			WHERE er.paid_price > 0
			GROUP BY er.id_account
		),
		account_stats AS (
			SELECT account_id, SUM(cnt) as total_invoices, SUM(amt) as total_spent
			FROM stats
			GROUP BY account_id
		)
		SELECT a.id, a.username, a.email, a.role, a.created_at,
		       COALESCE(s.total_invoices, 0) as transaction_count,
		       COALESCE(s.total_spent, 0) as total_spent
		FROM accounts a
		LEFT JOIN account_stats s ON s.account_id = a.id
		WHERE a.deleted_at IS NULL AND a.role != 'employee'
		  AND ($3 = '' OR a.username ILIKE $3 OR a.email ILIKE $3)
		%s
		LIMIT $1 OFFSET $2
	`, orderClause)
	rows, err := utils.Conn.Query(accountQuery, limit, offset, searchLike)
	if err != nil {
		return nil, 0, fmt.Errorf("error getting invoice users from DB: %v", err)
	}
	defer rows.Close()

	var users []models.InvoiceUser
	for rows.Next() {
		var u models.InvoiceUser
		if err := rows.Scan(&u.IDAccount, &u.Username, &u.Email, &u.Role, &u.CreatedAt, &u.TransactionCount, &u.TotalSpent); err != nil {
			return nil, 0, fmt.Errorf("error scanning invoice user row from DB: %v", err)
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
		WHERE a.deleted_at IS NULL AND a.role != 'employee'
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
		`SELECT id, username, email FROM accounts WHERE id = $1 AND deleted_at IS NULL AND role != 'employee';`,
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
// Uses snapshot prices (item_price, commission_rate, total_price) stored in the transactions table.
func getTransactionInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			t.id,
			t.created_at,
			t.id_transaction::text,
			i.title,
			COALESCE(t.item_price, 0),
			COALESCE(ROUND(t.item_price * t.commission_rate / 100, 2), 0),
			COALESCE(t.total_price, 0)
		FROM transactions t
		JOIN items i ON i.id = t.id_item
		WHERE t.id_pro = $1 AND t.action = 'purchased';
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
// Uses the snapshot price stored in the subscriptions table.
func getSubscriptionInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			s.id,
			s.sub_from,
			s.sub_to,
			s.price
		FROM subscriptions s
		WHERE s.id_pro = $1;
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
// Uses the snapshot total_price stored in the ads table.
func getAdInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			a.id,
			a.start_date::timestamptz,
			a.end_date::timestamptz,
			p.id,
			p.title,
			a.total_price
		FROM ads a
		JOIN posts p ON p.id = a.id_post
		WHERE p.id_account = $1;
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
// Uses the snapshot paid_price stored in the event_registrations table.
func getEventInvoices(accountID int) ([]models.UserInvoice, error) {
	query := `
		SELECT
			e.id,
			er.created_at,
			er.paid_price,
			e.title
		FROM event_registrations er
		JOIN events e ON e.id = er.id_event
		WHERE er.id_account = $1
		  AND er.paid_price > 0;
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
