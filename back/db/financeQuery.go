package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
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

// GetInvoiceUsers returns a paginated list of accounts with their transaction counts.
func GetInvoiceUsers(page, limit int, search string) ([]models.InvoiceUser, int, error) {
	offset := (page - 1) * limit
	searchLike := "%" + search + "%"

	query := `
		SELECT
		a.id,
		a.username,
		a.email,
		a.role,
		a.created_at,
		COUNT(DISTINCT t.id) FILTER (WHERE t.action = 'purchased') + COUNT(DISTINCT s.id) AS transaction_count,
		COALESCE(SUM(DISTINCT i.price), 0) +
		COALESCE((
			SELECT SUM(fs.value)
			FROM subscriptions s2
			JOIN finance_settings fs ON fs.key = 'subscription_price'
			WHERE s2.id_pro = a.id
		), 0) AS total_spent
		FROM accounts a
		LEFT JOIN pros p ON p.id_account = a.id
		LEFT JOIN transactions t ON t.id_pro = p.id_account
		LEFT JOIN items i ON i.id = t.id_item AND t.action = 'purchased'
		LEFT JOIN subscriptions s ON s.id_pro = p.id_account
		WHERE a.deleted_at IS NULL
		AND ($3 = '' OR a.username ILIKE $3 OR a.email ILIKE $3)
		GROUP BY a.id, a.username, a.email, a.role, a.created_at
		ORDER BY transaction_count DESC
		LIMIT $1 OFFSET $2;
	`
	rows, err := utils.Conn.Query(query, limit, offset, searchLike)
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
	countQuery := `
		SELECT COUNT(DISTINCT a.id)
		FROM accounts a
		WHERE a.deleted_at IS NULL
		  AND ($1 = '' OR a.username ILIKE $1 OR a.email ILIKE $1)
	`
	if err := utils.Conn.QueryRow(countQuery, searchLike).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("error counting invoice users from DB: %v", err)
	}

	return users, total, nil
}

// GetUserInvoices returns all transactions for a given account.
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

	query := `
		SELECT
			t.id,
			t.created_at,
			t.action::text,
			i.title,
			i.price,
			i.price * COALESCE((SELECT value FROM finance_settings WHERE key = 'commission_rate' LIMIT 1), 0) / 100 AS amount,
			t.id_transaction::text
		FROM transactions t
		JOIN items i ON i.id = t.id_item
		WHERE t.id_pro = $1 AND t.action = 'purchased'

		UNION ALL

		SELECT
			s.id,
			s.sub_from,
			'subscription',
			'Premium Subscription',
			COALESCE((SELECT value FROM finance_settings WHERE key = 'subscription_price' LIMIT 1), 0),
			COALESCE((SELECT value FROM finance_settings WHERE key = 'subscription_price' LIMIT 1), 0),
			s.id::text
		FROM subscriptions s
		WHERE s.id_pro = $1

		ORDER BY created_at DESC
	`
	rows, err := utils.Conn.Query(query, accountID)
	if err != nil {
		return resp, fmt.Errorf("error getting user invoices from DB: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var inv models.UserInvoice
		if err := rows.Scan(
			&inv.ID, &inv.CreatedAt, &inv.Action,
			&inv.ItemTitle, &inv.ItemPrice, &inv.Amount, &inv.IDTransaction,
		); err != nil {
			return resp, fmt.Errorf("error scanning user invoice row from DB: %v", err)
		}
		resp.Invoices = append(resp.Invoices, inv)
	}
	if err := rows.Err(); err != nil {
		return resp, fmt.Errorf("error iterating user invoices rows from DB: %v", err)
	}

	resp.Total = len(resp.Invoices)
	return resp, nil
}
