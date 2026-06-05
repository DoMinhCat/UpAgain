package cron

import (
	"backend/utils"
	"backend/utils/onesignal"
	"log/slog"
	"time"
)

func UpdateExpiredSubscription() {
	slog.Info("UpdateExpiredSubscription started", "time", time.Now().Format(time.RFC3339))

	// Find the pro IDs of subscriptions that are active but expired
	selectQuery := `
		SELECT DISTINCT id_pro
		FROM subscriptions
		WHERE is_active = true AND sub_to < NOW();
	`
	rows, err := utils.Conn.Query(selectQuery)
	if err != nil {
		slog.Error("UpdateExpiredSubscription failed to query expired subscriptions", "error", err)
		return
	}
	defer rows.Close()

	var expiredProIds []int
	for rows.Next() {
		var proId int
		if err := rows.Scan(&proId); err != nil {
			slog.Error("UpdateExpiredSubscription failed to scan row", "error", err)
			continue
		}
		expiredProIds = append(expiredProIds, proId)
	}

	query := `
	UPDATE pros p
	SET is_premium = false
	FROM subscriptions s
	WHERE s.id_pro = p.id_account
		AND s.is_active = true
		AND s.sub_to < NOW();
	`
	_, err = utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateExpiredSubscription failed to update pros", "error", err)
		return
	}

	query = `
	UPDATE subscriptions
	SET is_active = false
	WHERE is_active = true
		AND sub_to < NOW();
	`
	_, err = utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateExpiredSubscription failed to update subscriptions", "error", err)
		return
	}

	// Notify pros that their subscription expired
	for _, proId := range expiredProIds {
		go func(id int) {
			if errNoti := onesignal.HandleExpiredSubscriptionNoti(id); errNoti != nil {
				slog.Warn("HandleExpiredSubscriptionNoti failed", "accountId", id, "error", errNoti)
			}
		}(proId)
	}

	slog.Info("UpdateExpiredSubscription completed")
}