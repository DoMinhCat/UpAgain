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

func GetNotiSettings(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
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
		slog.Error("GetNotiSettingsByAccountId() failed", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, settings)
}

func UpdateNotiSetting(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
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
		slog.Error("UpdateNotiSetting() failed", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}
