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
	var sub_from time.Time
	var sub_to time.Time

	// get subscription price
	subscription_price, err := GetFinanceSettingByKey("subscription_price")
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
	}

	query := `
	select sub_from, sub_to from subscriptions where id_pro = $1
	and is_trial=false;
	`
	rows, err := utils.Conn.Query(query, id_account)
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		if err := rows.Scan(&sub_from, &sub_to); err != nil {
			return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
		}
		// price is monthly, so we divide by 30 to get price of 1 day
		total += int(subscription_price/30) * int(sub_to.Sub(sub_from).Hours()/24)
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

func GetAllSubscriptions(page, limit int, onlyActive bool) ([]models.SubscriptionWithUser, int, error) {
	activeFilter := ""
	if onlyActive {
		activeFilter = "AND s.is_active = true"
	} else {
		activeFilter = "AND s.is_active = false"
	}

	countQuery := `SELECT COUNT(*) FROM subscriptions s WHERE true ` + activeFilter

	var total int
	if err := utils.Conn.QueryRow(countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT s.id, s.is_trial, s.is_active, s.sub_from, s.sub_to, s.id_pro, s.cancel_reason,
			a.username, a.avatar
		FROM subscriptions s
		JOIN pros p ON s.id_pro = p.id_account
		JOIN accounts a ON p.id_account = a.id
		WHERE true ` + activeFilter + `
		ORDER BY s.sub_from DESC`

	if limit > 0 {
		offset := (page - 1) * limit
		query += ` LIMIT $1 OFFSET $2`
		rows, err := utils.Conn.Query(query, limit, offset)
		if err != nil {
			return nil, 0, err
		}
		defer rows.Close()
		return scanSubscriptions(rows, total)
	}

	rows, err := utils.Conn.Query(query)
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
