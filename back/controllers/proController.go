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

	active, err := db.IsProSubscriptionActive(idAccount)
	if err != nil {
		slog.Error("IsProSubscriptionActive check failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to verify subscription status.")
		return
	}
	if !active {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have an active premium subscription.")
		return
	}

	timeframe := r.URL.Query().Get("timeframe")

	// 1. Inventory Stats
	inventory, err := db.GetProInventoryAnalytics(timeframe)
	if err != nil {
		slog.Error("GetProInventoryAnalytics() failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve inventory analytics.")
		return
	}

	// 2. Impact Tracking
	totalCO2, materialUsage, err := db.GetProImpactTracking(idAccount, timeframe)
	if err != nil {
		slog.Error("GetProImpactTracking() failed", "controller", "GetProAnalytics", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve impact tracking stats.")
		return
	}

	// 3. Financial Stats
	totalPurchases, paidPurchases, totalSpent, err := db.GetProFinancialStats(idAccount, timeframe)
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

// GetProAlertMaterials godoc
// @Summary      Get professional alert materials
// @Description  Returns a list of materials selected by the pro to receive alerts for.
// @Tags         pro
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_account  path      int  true  "Account ID of the Professional"
// @Success      200         {array}   string
// @Failure      400         {object}  nil  "Invalid ID"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/pro-analytics/alerts [get]
func GetProAlertMaterials(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to access alerts.")
		return
	}

	idInput := r.PathValue("id_account")
	idAccount, err := strconv.Atoi(idInput)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid account ID.")
		slog.Error("GetProAlertMaterials() failed to parse id_account", "error", err)
		return
	}

	if claims.Role != "admin" && claims.Id != idAccount {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have permission to view these settings.")
		return
	}

	active, err := db.IsProSubscriptionActive(idAccount)
	if err != nil {
		slog.Error("IsProSubscriptionActive check failed", "controller", "GetProAlertMaterials", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to verify subscription status.")
		return
	}
	if !active {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have an active premium subscription.")
		return
	}

	materials, err := db.GetProAlertMaterials(idAccount)
	if err != nil {
		slog.Error("GetProAlertMaterials() failed", "controller", "GetProAlertMaterials", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve alert settings.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, materials)
}

// UpdateProAlertMaterials godoc
// @Summary      Update professional alert materials
// @Description  Saves the list of materials to receive alerts for.
// @Tags         pro
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id_account  path      int                                    true  "Account ID"
// @Param        body        body      models.UpdateProAlertMaterialsRequest  true  "List of materials"
// @Success      204         "No Content"
// @Failure      400         {object}  nil  "Invalid request"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/pro-analytics/alerts [put]
func UpdateProAlertMaterials(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized.")
		return
	}

	idInput := r.PathValue("id_account")
	idAccount, err := strconv.Atoi(idInput)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid account ID.")
		return
	}

	if claims.Role != "admin" && claims.Id != idAccount {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have permission to edit these settings.")
		return
	}

	active, err := db.IsProSubscriptionActive(idAccount)
	if err != nil {
		slog.Error("IsProSubscriptionActive check failed", "controller", "UpdateProAlertMaterials", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to verify subscription status.")
		return
	}
	if !active {
		utils.RespondWithError(w, http.StatusForbidden, "You do not have an active premium subscription.")
		return
	}

	var req models.UpdateProAlertMaterialsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		slog.Error("UpdateProAlertMaterials() invalid request JSON", "error", err)
		return
	}

	err = db.UpdateProAlertMaterials(idAccount, req.Materials)
	if err != nil {
		slog.Error("UpdateProAlertMaterials() failed", "controller", "UpdateProAlertMaterials", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update alert settings.")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
