package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
)

// GetNotiSettings godoc
// @Summary      Get notification settings
// @Description  Returns a list of notification settings for a specific account.
// @Tags         account
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_account path int true "Account ID"
// @Success      200 {array} models.NotiSetting
// @Failure      400 {string} string "Bad Request"
// @Failure      401 {string} string "Unauthorized"
// @Failure      403 {string} string "Forbidden"
// @Failure      500 {string} string "Internal Server Error"
// @Router       /accounts/{id_account}/notifications/ [get]
func GetNotiSettings(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid account ID")
		return
	}

	// Only admin or the account owner can get settings
	if claims.Role != "admin" && claims.Id != id_account {
		utils.RespondWithError(w, http.StatusForbidden, "Forbidden")
		return
	}

	settings, err := db.GetNotiSettingsByAccountId(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get notification settings")
		slog.Error("GetNotiSettingsByAccountId() failed", "controller", "GetNotiSettings", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, settings)
}

// UpdateNotiSetting godoc
// @Summary      Update notification setting
// @Description  Updates a specific notification setting for an account.
// @Tags         account
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id_account path int true "Account ID"
// @Param        payload body models.UpdateNotiSettingRequest true "Update payload"
// @Success      204 {object} nil "No Content"
// @Failure      400 {string} string "Bad Request"
// @Failure      401 {string} string "Unauthorized"
// @Failure      403 {string} string "Forbidden"
// @Failure      500 {string} string "Internal Server Error"
// @Router       /accounts/{id_account}/notifications/ [patch]
func UpdateNotiSetting(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid account ID")
		return
	}

	// Only admin or the account owner can update settings
	if claims.Role != "admin" && claims.Id != id_account {
		utils.RespondWithError(w, http.StatusForbidden, "Forbidden")
		return
	}

	var payload models.UpdateNotiSettingRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = db.UpdateNotiSetting(id_account, payload.NotiType, payload.IsEnabled)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update notification setting")
		slog.Error("UpdateNotiSetting() failed", "controller", "UpdateNotiSetting", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}
