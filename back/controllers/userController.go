package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	helpers "backend/utils/helpers"
	"log/slog"
	"net/http"
	"strconv"
)

// GetTotalScore godoc
// @Summary      Get total CO2 and UpScore
// @Description  Get the total CO2 saved and total UpScore from all approved items in the system.
// @Tags         user
// @Security     ApiKeyAuth
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
		co2, err := helpers.CalculateCO2(material, weight)
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

// GetUserImpact godoc
// @Summary      Get user's personal environmental impact
// @Description  Returns the total CO2, water, and electricity saved by the authenticated user based on their completed items.
// @Tags         user
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200  {object}  models.UserImpactStats  "Successfully retrieved impact stats"
// @Failure      401  {object}  nil                     "Unauthorized"
// @Failure      500  {object}  nil                     "Internal server error"
// @Router       /users/impact/ [get]
func GetUserImpact(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(models.AuthClaims)
	if claims.Role != "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	stats, err := db.GetUserImpactStats(claims.Id)
	if err != nil {
		slog.Error("GetUserImpactStats() failed", "controller", "GetUserImpact", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching your impact stats.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, stats)
}

// GetUserImpactItems godoc
// @Summary      Get user's completed items with impact
// @Description  Returns a paginated list of the authenticated user's completed items with per-item CO2, water, and electricity impact.
// @Tags         user
// @Security     ApiKeyAuth
// @Produce      json
// @Param        page   query     int  false  "Page number"
// @Param        limit  query     int  false  "Items per page"
// @Success      200    {object}  models.UserImpactItemsPagination  "Successfully retrieved items"
// @Failure      401    {object}  nil                               "Unauthorized"
// @Failure      400    {object}  nil                               "Invalid query parameters"
// @Failure      500    {object}  nil                               "Internal server error"
// @Router       /users/items/ [get]
func GetUserImpactItems(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(models.AuthClaims)
	if claims.Role != "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	page := 1
	limit := 10
	var err error

	query := r.URL.Query()
	if pageStr := query.Get("page"); pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid page parameter.")
			return
		}
	}
	if limitStr := query.Get("limit"); limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 100 {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid limit parameter.")
			return
		}
	}

	items, total, err := db.GetUserImpactItems(claims.Id, page, limit)
	if err != nil {
		slog.Error("GetUserImpactItems() failed", "controller", "GetUserImpactItems", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching your items.")
		return
	}

	lastPage := 1
	if total > 0 {
		lastPage = (total + limit - 1) / limit
	}

	utils.RespondWithJSON(w, http.StatusOK, models.UserImpactItemsPagination{
		Items:        items,
		CurrentPage:  page,
		LastPage:     lastPage,
		Limit:        limit,
		TotalRecords: total,
	})
}
