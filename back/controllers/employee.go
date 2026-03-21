package controllers

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"
)

// get all employees not being occupied during the specific time
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

	



	
}
