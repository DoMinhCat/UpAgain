package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
)

// GetTotalCO2 godoc
// @Summary      Get total CO2
// @Description  Get the total CO2 saved
// @Tags         user
// @Produce      json
// @Router       /users/score/{$} [get]
func GetTotalScore(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	stats, err := db.GetTotalScoreStats()
	if err != nil {
		slog.Error("GetTotalScoreStats() failed", "controller", "GetTotalScore", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching total score stats.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, stats)
}