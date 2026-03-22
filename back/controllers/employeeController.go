package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"time"
)

// GetAvailableEmployees godoc
// @Summary      Get available employees
// @Description  Get a list of employees not occupied during a specific time range.
// @Tags         employee
// @Produce      json
// @Param        start_at  query     string  true  "Start date (RFC3339 format, e.g., 2026-03-22T17:00:00Z)"
// @Param        end_at    query     string  true  "End date (RFC3339 format, e.g., 2026-03-22T19:00:00Z)"
// @Success      200       {object}  models.AvailableEmployeesResponse  "List of available employees"
// @Failure      400       {object}  nil                            "Invalid time format"
// @Failure      401       {object}  nil                            "Unauthorized"
// @Failure      500       {object}  nil                            "Internal server error"
// @Router       /employees/available/ [get]
func GetAvailableEmployees(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	from := r.URL.Query().Get("start_at")
	to := r.URL.Query().Get("end_at")

	fromTime, err := time.Parse("2006-01-02T15:04:05Z", from)
	if err != nil {
		slog.Error("Invalid start_at format", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid start_at format.")
		return
	}

	toTime, err := time.Parse("2006-01-02T15:04:05Z", to)
	if err != nil {
		slog.Error("Invalid end_at format", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid end_at format.")
		return
	}

	employees, err := db.GetAvailableEmployeesByTime(fromTime, toTime)
	if err != nil {
		slog.Error("Error fetching available employees", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching available employees.")
		return
	}

	if employees.Employees == nil {
		employees.Employees = []models.AvailableEmployee{}
	}
	utils.RespondWithJSON(w, http.StatusOK, employees)
}
