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

// Login godoc
// @Summary      Login
// @Description  Authenticate a user and return a JWT token and set a refresh token cookie
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        credentials  body      models.LoginRequest  true  "Login credentials"
// @Success      200          {object}  map[string]string    "token"
// @Failure      400          {object}  nil                  "Invalid request body"
// @Failure      401          {object}  nil                  "Incorrect email or password"
// @Failure      500          {object}  nil                  "Internal server error"
// @Router       /login/ [post]
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
	if existing == nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Oops, incorrect email or password.")
		slog.Error("No account found", "controller", "Login", "email", creds.Email)
		return
	}

	if existing.IsBanned {
		response.RespondWithError(w, http.StatusUnauthorized, "Your account has been banned, please contact an admin to unban your account.")
		return
	}

	if creds.Email != existing.Email || !utils.IsPasswordCorrect(existing.Password, creds.Password) {
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

	token, err := utils.GenerateJWT(creds.Email, existing.Role, existing.Id, existing.Username)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		return
	}
	refreshToken, err := utils.GenerateRefreshToken(creds.Email, existing.Role, existing.Id, existing.Username)
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

// RefreshToken godoc
// @Summary      Refresh Token
// @Description  Refresh the JWT token using the refresh token cookie
// @Tags         auth
// @Produce      json
// @Success      200  {object}  map[string]string  "token"
// @Failure      401  {object}  nil                "No refresh token found or invalid refresh token"
// @Failure      500  {object}  nil                "Internal server error"
// @Router       /refresh/ [post]
func RefreshToken(w http.ResponseWriter, r *http.Request) {
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
	token, err := utils.GenerateJWT(claims.Email, claims.Role, claims.Id, claims.Username)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		slog.Error("GenerateJWT() failed", "controller", "RefreshToken", "error", err)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// VerifyEmail godoc
// @Summary      Verify email
// @Description  Confirms an account's email address using the token sent by email at registration
// @Tags         auth
// @Produce      json
// @Param        token path string true "Email verification token"
// @Success      200  {object}  nil  "Email verified successfully"
// @Failure      400  {object}  nil  "Invalid or expired verification link"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /verify-email/{token}/ [get]
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")

	idAccount, _, err := utils.ParseEmailVerificationToken(token)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid or expired verification link.")
		slog.Error("ParseEmailVerificationToken() failed", "controller", "VerifyEmail", "error", err)
		return
	}

	err = db.SetEmailVerified(idAccount)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "An error occurred.")
		slog.Error("SetEmailVerified() failed", "controller", "VerifyEmail", "error", err)
		return
	}

	response.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Email verified successfully."})
}
