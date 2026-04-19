package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	validations "backend/utils/validations"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// GetFinanceRevenue godoc
// @Summary      Get monthly revenue
// @Description  Returns monthly revenue data grouped by category (subscriptions, commissions, ads, events) for a given year, along with a yearly summary.
// @Tags         finance
// @Security     ApiKeyAuth
// @Produce      json
// @Param        year  query     int  false  "Year (defaults to current year, must be between 2000 and 2100)"
// @Success      200   {object}  models.RevenueResponse
// @Failure      400   {object}  nil  "Invalid year parameter"
// @Failure      401   {object}  nil  "Unauthorized"
// @Failure      500   {object}  nil  "Internal server error"
// @Router       /finance/revenue/ [get]
func GetFinanceRevenue(w http.ResponseWriter, r *http.Request) {
	yearStr := r.URL.Query().Get("year")
	year := time.Now().Year()
	if yearStr != "" {
		parsed, err := strconv.Atoi(yearStr)
		if err != nil || parsed < 2000 || parsed > 2100 {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid year parameter.")
			return
		}
		year = parsed
	}

	data, err := db.GetRevenueByYear(year)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching revenue data.")
		slog.Error("GetRevenueByYear() failed", "controller", "GetFinanceRevenue", "error", err)
		return
	}

	var summary models.RevenueSummary
	for _, d := range data {
		summary.TotalSubscriptions += d.Subscriptions
		summary.TotalCommissions += d.Commissions
		summary.TotalAds += d.Ads
		summary.TotalEvents += d.Events
	}
	summary.GrandTotal = summary.TotalSubscriptions + summary.TotalCommissions + summary.TotalAds + summary.TotalEvents

	utils.RespondWithJSON(w, http.StatusOK, models.RevenueResponse{
		Year:    year,
		Data:    data,
		Summary: summary,
	})
}

// GetFinanceSettings godoc
// @Summary      Get finance settings
// @Description  Returns all finance settings. Admin only.
// @Tags         finance
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200  {array}   models.FinanceSetting
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /finance/settings/ [get]
func GetFinanceSettings(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}

	settings, err := db.GetAllFinanceSettings()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching finance settings.")
		slog.Error("GetAllFinanceSettings() failed", "controller", "GetFinanceSettings", "error", err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, settings)
}

// GetFinanceSettingsByKey godoc
// @Summary      Get finance setting by key
// @Description  Returns a specific finance setting by its key. Accessible to all users.
// @Tags         finance
// @Produce      json
// @Param        key  path      string  true  "Setting key (e.g., trial_days, commission_rate, ads_price_per_month, subscription_price)"
// @Success      200  {number}  float64
// @Failure      400  {object}  nil  "Missing or invalid key parameter"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /finance/settings/{key}/ [get]
func GetFinanceSettingsByKey(w http.ResponseWriter, r *http.Request) {
	// This route should be accessible for all (example: guest take price/trial days)
	key := r.PathValue("key")
	if key == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing key parameter.")
		return
	}
	if key != "trial_days" && key != "commission_rate" && key != "ads_price_per_month" && key != "subscription_price" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid key.")
		return
	}

	setting, err := db.GetFinanceSettingByKey(key)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching finance settings.")
		slog.Error("GetFinanceSettingByKey() failed", "controller", "GetFinanceSettingsByKey", "error", err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, setting)
}

// UpdateFinanceSetting godoc
// @Summary      Update finance setting
// @Description  Updates one finance setting by key. Keys: trial_days, commission_rate, ads_price_per_month, subscription_price. Admin only.
// @Tags         finance
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        key   path      string                              true  "Setting key"
// @Param        body  body      models.UpdateFinanceSettingRequest  true  "Setting value payload"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  nil  "Invalid request or missing key"
// @Failure      401   {object}  nil  "Unauthorized"
// @Failure      500   {object}  nil  "Internal server error"
// @Router       /finance/settings/{key}/ [put]
func UpdateFinanceSetting(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}

	key := r.PathValue("key")
	if key == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing key parameter.")
		return
	}
	if key != "trial_days" && key != "commission_rate" && key != "ads_price_per_month" && key != "subscription_price" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid key.")
		return
	}

	var payload models.UpdateFinanceSettingRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	if err := validations.ValidateFinanceSetting(key, payload.Value); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	oldValue, err := db.UpdateFinanceSetting(key, payload.Value)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the setting.")
		slog.Error("UpdateFinanceSetting() failed", "controller", "UpdateFinanceSetting", "error", err)
		return
	}

	adminID := r.Context().Value("user").(models.AuthClaims).Id
	histErr := db.InsertHistory(
		"finance_setting", key, "update", adminID,
		map[string]interface{}{"key": key, "value": oldValue},
		map[string]interface{}{"key": key, "value": payload.Value},
	)
	if histErr != nil {
		slog.Error("InsertHistory() failed", "controller", "UpdateFinanceSetting", "error", histErr)
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"key":   key,
		"value": payload.Value,
	})
}

// GetInvoiceUsers godoc
// @Summary      Get invoice users
// @Description  Returns a paginated list of accounts with their total transaction count and total amount spent. Supports search by username or email.
// @Tags         finance
// @Security     ApiKeyAuth
// @Produce      json
// @Param        page    query     int     false  "Page number (default 1)"
// @Param        limit   query     int     false  "Items per page (default 10, max 100)"
// @Param        search  query     string  false  "Search by username or email"
// @Success      200     {object}  models.InvoicesListResponse
// @Failure      400     {object}  nil  "Invalid page or limit parameter"
// @Failure      401     {object}  nil  "Unauthorized"
// @Failure      500     {object}  nil  "Internal server error"
// @Router       /finance/invoices/ [get]
func GetInvoiceUsers(w http.ResponseWriter, r *http.Request) {
	page := 1
	limit := 10

	if p := r.URL.Query().Get("page"); p != "" {
		parsed, err := strconv.Atoi(p)
		if err != nil || parsed < 1 {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid page parameter.")
			return
		}
		page = parsed
	}

	if l := r.URL.Query().Get("limit"); l != "" {
		parsed, err := strconv.Atoi(l)
		if err != nil || parsed < 1 || parsed > 100 {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid limit parameter.")
			return
		}
		limit = parsed
	}

	search := r.URL.Query().Get("search")
	sortQuery := r.URL.Query().Get("sort")

	users, total, err := db.GetInvoiceUsers(page, limit, search, sortQuery)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching users.")
		slog.Error("GetInvoiceUsers() failed", "controller", "GetInvoiceUsers", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, models.InvoicesListResponse{
		Users: users,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

// GetUserInvoices godoc
// @Summary      Get user invoices
// @Description  Returns all invoices (transactions, subscriptions, ads, events) for a specific account. Admins can access any user's invoices; non-admin users can only access their own.
// @Tags         finance
// @Security     ApiKeyAuth
// @Produce      json
// @Param        userId  path      int  true  "Account ID"
// @Success      200     {object}  models.UserInvoicesResponse
// @Failure      400     {object}  nil  "Invalid user ID"
// @Failure      401     {object}  nil  "Unauthorized or forbidden"
// @Failure      404     {object}  nil  "User not found"
// @Failure      500     {object}  nil  "Internal server error"
// @Router       /finance/invoices/{userId}/ [get]
func GetUserInvoices(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "pro" && role != "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	userIDStr := r.PathValue("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID < 1 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid user ID.")
		return
	}

	// Non-admin users can only access their own invoices.
	if role != "admin" && userID != idRequestor {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}

	deleted := false
	exist, err := db.CheckAccountExistsById(userID, &deleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching user's invoices.")
		slog.Error("CheckAccountExistsById() failed", "controller", "GetUserInvoices", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "User with ID "+userIDStr+" not found.")
		return
	}

	resp, err := db.GetUserInvoices(userID)
	if err != nil {
		if err.Error() == "account not found" {
			utils.RespondWithError(w, http.StatusNotFound, "User with ID "+userIDStr+" not found.")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching user's invoices.")
		slog.Error("GetUserInvoices() failed", "controller", "GetUserInvoices", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, resp)
}
