package cron

import (
	"backend/utils"
	"log/slog"
	"time"
)

func UpdateExpiredAds() {
	slog.Info("UpdateExpiredAds started", "time", time.Now().Format(time.RFC3339))

	query := `
    UPDATE ads a
    SET status = 'expired'
    FROM posts p
    WHERE a.id_post = p.id
        AND a.status = 'active'
        AND a.end_date < NOW();
    `
	_, err := utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateExpiredAds failed", "error", err)
		return
	}

	slog.Info("UpdateExpiredAds completed")
}
