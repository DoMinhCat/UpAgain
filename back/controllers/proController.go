package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

// GetProAnalytics godoc
// @Summary      Get professional premium analytics
// @Description  Returns statistics including inventory, material impact (CO2 and weights), and financial transactions.
// @Tags         pro
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_account  path      int  true  "Account ID of the Professional"
// @Success      200         {object}  models.ProAnalyticsResponse
// @Failure      400         {object}  nil  "Invalid ID"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/pro-analytics [get]
func GetProAnalytics(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to access analytics.")
		return
	}

	idInput := r.PathValue("id_account")
	idAccount, err := strconv.Atoi(idInput)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid account ID.")
		slog.Error("GetProAnalytics() failed to parse id_account", "error", err)
		return
	}

	if claims.Role != "admin" && claims.Id != idAccount {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have permission to view these analytics.")
		return
	}

	// 1. Inventory Stats
	inventory, err := db.GetProInventoryAnalytics()
	if err != nil {
		slog.Error("GetProInventoryAnalytics() failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve inventory analytics.")
		return
	}

	// 2. Impact Tracking
	totalCO2, materialUsage, err := db.GetProImpactTracking(idAccount)
	if err != nil {
		slog.Error("GetProImpactTracking() failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve impact tracking stats.")
		return
	}

	// 3. Financial Stats
	totalPurchases, paidPurchases, totalSpent, err := db.GetProFinancialStats(idAccount)
	if err != nil {
		slog.Error("GetProFinancialStats() failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve financial dashboard stats.")
		return
	}

	var res models.ProAnalyticsResponse
	res.Inventory = inventory
	res.Impact.TotalCO2 = totalCO2
	res.Impact.MaterialUsage = materialUsage
	res.Finance.TotalPurchases = totalPurchases
	res.Finance.PaidPurchases = paidPurchases
	res.Finance.TotalSpent = totalSpent

	utils.RespondWithJSON(w, http.StatusOK, res)
}
