package cron

import (
	"backend/utils"
	"log/slog"
	"time"
)

func UpdateEventRegistrationStatus() {
	slog.Info("UpdateEventRegistrationStatus started", "time", time.Now().Format(time.RFC3339))

	query := `
	UPDATE event_registrations er
	SET status = 'attended' 
	FROM events e
	WHERE er.id_event = e.id
		AND er.status = 'registered'
		AND e.end_at < NOW()
		AND e.status = 'approved';
	`
	_, err := utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateEventRegistrationStatus failed", "error", err)
		return
	}
	
	slog.Info("UpdateEventRegistrationStatus completed")
}