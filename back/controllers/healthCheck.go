package controllers

import (
	"backend/utils"
	"fmt"
	"log/slog"
	"net/http"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	slog.Debug("HealthCheck() called")
	err := utils.Conn.Ping()
	if err != nil {
		fmt.Fprintf(w, "Error connecting to database: %v", err)
	} else {
		var result = "Database connected successfully"
		fmt.Fprintf(w, "%s", result)
	}
}
