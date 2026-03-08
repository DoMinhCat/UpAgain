package controllers

import (
	"backend/db"
	"backend/models"
	response "backend/utils"
	utils "backend/utils/auth"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var creds models.LoginRequest
	err := json.NewDecoder(r.Body).Decode(&creds)

	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "An error occurred.")
		slog.Error("invalid JSON request body", "controller", "Login", "error", err)
		return
	}

	existing, err := db.GetAccountCredsByEmail(creds.Email)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		slog.Error("GetAccountCredsByEmail() failed", "controller", "Login", "error", err)
		return
	}

	if existing == nil || creds.Email != existing.Email || !utils.IsPasswordCorrect(existing.Password, creds.Password) {
		response.RespondWithError(w, http.StatusUnauthorized, "Oops, incorrect email or password.")
		return
	}

	// check if is admin
	if existing.Role == "employee" {
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
	refreshToken, err := utils.GenerateRefreshToken(creds.Email, existing.Role, existing.Id)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		return
	}

	cookie := http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		Expires:  time.Now().Add(time.Hour * 24 * 7),
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, &cookie)

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	slog.Debug("RefreshToken was called", "controller", "RefreshToken")
	cookie, err := r.Cookie("refreshToken")
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "No refresh token found.")
		slog.Error("No refresh token found", "controller", "RefreshToken", "error", err)
		return
	}
	claims, err := utils.ParseJWT(cookie.Value)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid refresh token.")
		slog.Error("Invalid refresh token", "controller", "RefreshToken", "error", err)
		return
	}
	token, err := utils.GenerateJWT(claims.Email, claims.Role, claims.Id)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		slog.Error("GenerateJWT() failed", "controller", "RefreshToken", "error", err)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
