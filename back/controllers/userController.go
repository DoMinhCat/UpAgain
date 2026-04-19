package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/helper"
	"log/slog"
	"net/http"
)

// GetTotalScore godoc
// @Summary      Get total CO2 and UpScore
// @Description  Get the total CO2 saved and total UpScore from all approved items in the system.
// @Tags         user
// @Produce      json
// @Success      200      {object}  models.TotalScoreStats  "Successfully retrieved total score stats"
// @Failure      401      {object}  nil                     "Unauthorized"
// @Failure      500      {object}  nil                     "Internal server error"
// @Router       /users/score/ [get]
func GetTotalScore(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	total, err := db.GetTotalScore()
	if err != nil {
		slog.Error("GetTotalScore() failed", "controller", "GetTotalScore", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching total score.")
		return
	}

	var totalCO2 float64
	materials := []string{"wood", "metal", "textile", "glass", "plastic", "mixed"}
	for _, material := range materials {
		weight, err := db.GetTotalWeightByMaterialByStatus(material, "approved")
		if err != nil {
			slog.Error("GetTotalWeightByMaterialByStatus() failed", "controller", "GetTotalScore", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching total weight.")
			return
		}
		co2, err := helper.CalculateCO2(material, weight)
		if err != nil {
			slog.Error("CalculateCO2() failed", "controller", "GetTotalScore", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while calculating CO2.")
			return
		}
		totalCO2 += co2
	}

	stats := models.TotalScoreStats{
		Total: total.Total,
		CO2:   totalCO2,
	}

	utils.RespondWithJSON(w, http.StatusOK, stats)
}
