package cron

import (
	"backend/utils"
	"log/slog"
	"time"
)

func UpdateExpiredSubscription() {
    slog.Info("UpdateExpiredSubscription started", "time", time.Now().Format(time.RFC3339))

	query := `
	UPDATE pros p
	SET is_premium = false
	FROM subscriptions s
	WHERE s.id_pro = p.id_account
		AND s.is_active = true
		AND s.sub_to < NOW();
	`
	_, err := utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateExpiredSubscription failed", "error", err)
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
        slog.Error("UpdateExpiredSubscription failed", "error", err)
        return
    }

	// TODO: notify pros that their sub expired
	// type = profile
    
    slog.Info("UpdateExpiredSubscription completed")
}