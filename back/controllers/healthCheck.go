package controllers

import (
	"backend/utils"
	"fmt"
	"log/slog"
	"net/http"
)

// HealthCheck godoc
// @Summary      Health Check
// @Description  Check the database connection status
// @Tags         health
// @Produce      plain
// @Success      200  {string}  string  "Database connected successfully"
// @Failure      500  {string}  string  "Error connecting to database: ..."
// @Router       /healthcheck/ [get]
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
