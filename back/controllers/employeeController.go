package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
)

// GetAvailableEmployees returns all employees not being occupied during the specific time
func GetAvailableEmployees(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var payload models.AvailableEmployeesRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	employees, err := db.GetAvailableEmployeesByTime(payload.From, payload.To)
	if err != nil {
		slog.Error("Error fetching available employees", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching available employees.")
		return
	}

	if employees == nil {
		employees = []models.AvailableEmployeesResponse{}
	}
	utils.RespondWithJSON(w, http.StatusOK, employees)
}
