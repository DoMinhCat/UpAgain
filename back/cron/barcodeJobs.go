package cron

import (
	"log/slog"
	"time"
)

func UpdateExpiredCode() {
	slog.Info("UpdateExpiredCode started", "time", time.Now().Format(time.RFC3339))

	//TODO

	slog.Info("UpdateExpiredCode completed")
}

func UpdateActiveCode() {
	slog.Info("UpdateActiveCode started", "time", time.Now().Format(time.RFC3339))

	//TODO

	slog.Info("UpdateActiveCode completed")
}