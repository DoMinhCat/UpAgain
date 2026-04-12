package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// GetFinanceRevenue returns monthly revenue grouped by category for a given year.
// Query params: year (optional, defaults to current year)
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

// GetInvoiceUsers returns a paginated list of accounts with their transaction counts.
// Query params: page (default 1), limit (default 20), search (optional)
func GetInvoiceUsers(w http.ResponseWriter, r *http.Request) {
	page := 1
	limit := 20

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

	users, total, err := db.GetInvoiceUsers(page, limit, search)
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

// GetUserInvoices returns all transactions/invoices for a specific account.
// URL param: userId
func GetUserInvoices(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID < 1 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid user ID.")
		return
	}

	resp, err := db.GetUserInvoices(userID)
	if err != nil {
		if err.Error() == "account not found" {
			utils.RespondWithError(w, http.StatusNotFound, "User not found.")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching invoices.")
		slog.Error("GetUserInvoices() failed", "controller", "GetUserInvoices", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, resp)
}
