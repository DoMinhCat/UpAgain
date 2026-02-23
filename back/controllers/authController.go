package controllers

import (
	"backend/db"
	"backend/models"
	response "backend/utils"
	utils "backend/utils/auth"
	"encoding/json"
	"log/slog"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) { 
	var creds models.LoginRequest 
	err := json.NewDecoder(r.Body).Decode(&creds) 

	if err != nil { 
		response.RespondWithError(w, http.StatusBadRequest, "An error occurred.")
		slog.Error("invalid JSON request body", "error", err)
		return 
	} 

	existing, err := db.GetAccountCredsByEmail(creds.Email) 
	if err != nil { 
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		slog.Error("GetAccountCredsByEmail() failed", "controller", "Login", "error", err)
		return 
	}

	if existing == nil || creds.Email != existing.Email || !utils.IsPasswordCorrect(existing.Password, creds.Password){ 
		response.RespondWithError(w, http.StatusUnauthorized, "Oops, incorrect email or password.")
		return 
	}

	// check if is admin
	if existing.Role=="employee"{
		isAdmin, err := db.GetEmployeeRoleById(existing.Id)
		if err != nil { 
    		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
			slog.Error("GetEmployeeRoleById() failed", "controller", "Login", "error", err)
		return 
		}
		if isAdmin {
			existing.Role = "admin"
		} else {
			existing.Role = "employee"
		}
	}

	token, err := utils.GenerateJWT(creds.Email, existing.Role, existing.Id)
	if err != nil { 
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		return 
	} 

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}