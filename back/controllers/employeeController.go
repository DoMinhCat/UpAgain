package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
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

func GetEmployeeSchedule(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	id_employee, err := strconv.Atoi(r.PathValue("id_employee"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid Employee ID.")
		return
	}

	// if employee is not admin, can't see schedule of other employees
	if role == "employee" && id_employee != idRequestor {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	isDel := false
	empExist, err := db.CheckAccountExistsById(id_employee, &isDel)
	if err != nil {
		slog.Error("CheckAccountExistsById() failed", "controller", "GetEmployeeSchedule", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching employee's schedule.")
		return
	}
	if !empExist {
		utils.RespondWithError(w, http.StatusNotFound, "Employee with ID "+strconv.Itoa(id_employee)+" not found.")
		return
	}

	events, err := db.GetEmployeeEventsByEmployeeId(id_employee)
	if err != nil {
		slog.Error("GetEmployeeEventsByEmployeeId() failed", "controller", "GetEmployeeSchedule", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching employee's schedule.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, events)
}
