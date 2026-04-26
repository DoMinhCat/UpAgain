package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

func GetTotalSubscriptionSpendingsById(id_account int) (int, error) {
	var total int

	// Uses snapshot price stored in subscriptions table at purchase time
	query := `
	select COALESCE(sum(price), 0) from subscriptions
	where id_pro = $1 and is_trial=false;
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
	}
	return total, nil
}

func GetTotalActiveSubscriptionById(id_account int) (int, error) {
	var total int
	query := `
		select count(*) from subscriptions
		where id_pro = $1 and is_trial=false and is_active=true;
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveSubscriptionById() failed: %v", err.Error())
	}
	return total, nil
}

func GetAllSubscriptions(page, limit int, onlyActive bool, filters models.SubscriptionFilters) ([]models.SubscriptionWithUser, int, error) {
	activeFilter := ""
	if onlyActive {
		activeFilter = "AND s.is_active = true"
	} else {
		activeFilter = "AND s.is_active = false AND s.is_trial = false"
	}

	args := []interface{}{}
	argIdx := 1
	searchFilter := ""
	trialFilter := ""

	if filters.Search != "" {
		searchFilter = fmt.Sprintf(" AND (a.username ILIKE $%d OR CAST(s.id AS TEXT) = $%d)", argIdx, argIdx+1)
		args = append(args, "%"+filters.Search+"%", filters.Search)
		argIdx += 2
	}

	if filters.IsTrial != nil {
		trialFilter = fmt.Sprintf(" AND s.is_trial = $%d", argIdx)
		args = append(args, *filters.IsTrial)
		argIdx++
	}

	sortClause := "ORDER BY s.sub_from DESC"
	switch filters.SortBy {
	case "sub_from_asc":
		sortClause = "ORDER BY s.sub_from ASC"
	case "sub_to_asc":
		sortClause = "ORDER BY s.sub_to ASC"
	case "sub_to_desc":
		sortClause = "ORDER BY s.sub_to DESC"
	}

	whereClause := "WHERE true " + activeFilter + searchFilter + trialFilter

	countQuery := `SELECT COUNT(*) FROM subscriptions s
        JOIN pros p ON s.id_pro = p.id_account
        JOIN accounts a ON p.id_account = a.id ` + whereClause

	var total int
	if err := utils.Conn.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
        SELECT s.id, s.is_trial, s.is_active, s.sub_from, s.sub_to, s.id_pro, s.cancel_reason,
               a.username, a.avatar
        FROM subscriptions s
        JOIN pros p ON s.id_pro = p.id_account
        JOIN accounts a ON p.id_account = a.id ` + whereClause + ` ` + sortClause

	if limit > 0 && filters.Search == "" {
		offset := (page - 1) * limit
		paginatedArgs := append(args, limit, offset)
		query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argIdx, argIdx+1)
		rows, err := utils.Conn.Query(query, paginatedArgs...)
		if err != nil {
			return nil, 0, err
		}
		defer rows.Close()
		return scanSubscriptions(rows, total)
	}

	rows, err := utils.Conn.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	return scanSubscriptions(rows, total)
}

func scanSubscriptions(rows *sql.Rows, total int) ([]models.SubscriptionWithUser, int, error) {
	subs := []models.SubscriptionWithUser{}

	for rows.Next() {
		var s models.SubscriptionWithUser
		if err := rows.Scan(
			&s.ID, &s.IsTrial, &s.IsActive, &s.SubFrom, &s.SubTo, &s.IdPro, &s.CancelReason,
			&s.Username,
			&s.Avatar,
		); err != nil {
			return nil, 0, err
		}
		subs = append(subs, s)
	}
	return subs, total, nil
}

func CheckSubscriptionExistById(id int) (bool, error) {
	var exist bool
	query := `SELECT EXISTS(SELECT 1 FROM subscriptions WHERE id = $1)`
	err := utils.Conn.QueryRow(query, id).Scan(&exist)
	return exist, err
}

func GetSubscriptionByID(id int) (models.SubscriptionWithUser, error) {
	query := `
    SELECT s.id, s.is_trial, s.is_active, s.sub_from, s.sub_to, s.id_pro, s.cancel_reason,
           a.username, a.avatar
    FROM subscriptions s
    JOIN pros p ON s.id_pro = p.id_account
    JOIN accounts a ON p.id_account = a.id
    WHERE s.id = $1`

	var s models.SubscriptionWithUser
	err := utils.Conn.QueryRow(query, id).Scan(
		&s.ID, &s.IsTrial, &s.IsActive, &s.SubFrom, &s.SubTo, &s.IdPro, &s.CancelReason,
		&s.Username, &s.Avatar,
	)
	return s, err
}

func RevokeSubscription(id int, reason string) error {
	query := `UPDATE subscriptions SET is_active = false, cancel_reason = $1 WHERE id = $2`
	_, err := utils.Conn.Exec(query, reason, id)
	return err
}

func GetSubscriptionStats(timeframe *string) (models.SubscriptionStats, error) {
	var stats models.SubscriptionStats

	timeFilter := ""
	if timeframe != nil && *timeframe != "all" {
		switch *timeframe {
		case "today":
			timeFilter = "AND sub_from >= NOW() - INTERVAL '1 day'"
		case "last_3_days":
			timeFilter = "AND sub_from >= NOW() - INTERVAL '3 days'"
		case "last_week":
			timeFilter = "AND sub_from >= NOW() - INTERVAL '7 days'"
		case "last_month":
			timeFilter = "AND sub_from >= NOW() - INTERVAL '30 days'"
		case "last_year":
			timeFilter = "AND sub_from >= NOW() - INTERVAL '365 days'"
		}
	}

	// total all time
	if err := utils.Conn.QueryRow(`SELECT COUNT(*) FROM subscriptions WHERE is_trial = false`).Scan(&stats.Total); err != nil {
		return stats, err
	}
	// active
	if err := utils.Conn.QueryRow(`SELECT COUNT(*) FROM subscriptions WHERE is_active = true AND is_trial = false`).Scan(&stats.Active); err != nil {
		return stats, err
	}
	// active trials
	if err := utils.Conn.QueryRow(`SELECT COUNT(*) FROM subscriptions WHERE is_active = true AND is_trial = true`).Scan(&stats.ActiveTrials); err != nil {
		return stats, err
	}
	// cancelled all time
	if err := utils.Conn.QueryRow(`SELECT COUNT(*) FROM subscriptions WHERE is_active = false AND is_trial = false`).Scan(&stats.Cancelled); err != nil {
		return stats, err
	}
	// new subscriptions (timeframe)
	if err := utils.Conn.QueryRow(`SELECT COUNT(*) FROM subscriptions WHERE is_trial = false ` + timeFilter).Scan(&stats.NewSubscriptions); err != nil {
		return stats, err
	}
	// cancellation rate
	if stats.Total > 0 {
		stats.CancellationRate = float64(stats.Cancelled) / float64(stats.Total) * 100
	}

	return stats, nil
}

func CreateSubscription(id_pro int, is_trial bool) error {
	sub_to := time.Now().AddDate(0, 1, 0)
	current_price, err := GetFinanceSettingByKey("subscription_price")
	if err != nil {
		return err
	}
	query := `
	INSERT INTO subscriptions (is_trial, sub_to, id_pro, price) 
	VALUES ($1, $2, $3, $4);`
	_, err = utils.Conn.Exec(query, is_trial, sub_to, id_pro, current_price)
	return err
}
