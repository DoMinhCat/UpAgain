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

func GetAllItems(w http.ResponseWriter, r *http.Request){
	var err error
	// default pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	filters := models.ItemFilters{
		Search:   query.Get("search"),
		Sort:     query.Get("sort"),
		Category: query.Get("category"),
		Status: query.Get("status"),
		Material: query.Get("material"),
	}

	items, total, err := db.GetAllItems(page, limit, filters)
	if err != nil {
		slog.Error("GetAllItems() failed", "controller", "GetAllItems", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.ItemListPagination{
		Items:        items,
		CurrentPage:  page,
		LastPage:     lastPage,
		Limit:        limit,
		TotalRecords: total,
	}
	if page == -1 || limit == -1 {
		result.CurrentPage = 1
		result.LastPage = 1
	}
	utils.RespondWithJSON(w, http.StatusOK, result)
}

func GetAllItemsStats(w http.ResponseWriter, r *http.Request){
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var timeParam time.Time
	var err error
	timeUrl := r.URL.Query().Get("timeframe")
	if timeUrl != "" && timeUrl != "all"{
		switch timeUrl {
		case "today":
			timeParam = time.Now().AddDate(0, 0, -1)
		case "last_3_days":
			timeParam = time.Now().AddDate(0, 0, -3)
		case "last_week":
			timeParam = time.Now().AddDate(0, 0, -7)
		case "last_month":
			timeParam = time.Now().AddDate(0, -1, 0)
		case "last_year":
			timeParam = time.Now().AddDate(-1, 0, 0)
		default:
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid timeframe.")
			return
		}
	}

	// total active items
	status := "approved"
	activeItems, err := db.GetItemsCountByStatus(&status)
	if err != nil {
		slog.Error("GetActiveItemsCount() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total new items since last month
	newItemsSince, err := db.GetTotalItemsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		slog.Error("GetTotalItemsSince() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total pending items
	status = "pending"
	pendingItems, err := db.GetItemsCountByStatus(&status)
	if err != nil {
		slog.Error("GetItemsCountByStatus() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total transactions since last month
	newTransactionsSince, err := db.GetTotalTransactionsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		slog.Error("GetTotalTransactionsSince() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total transactions
	status="purchased"
	totalTransactions, err := db.GetTotalTransactionsByStatus(status, &timeParam)
	if err != nil {
		slog.Error("GetTotalTransactions() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	result := models.ItemAdminStats{
		ActiveItems:          activeItems,
		PendingItems:         pendingItems,
		NewItemsSince:        newItemsSince,
		NewTransactionsSince: newTransactionsSince,
		TotalTransactions:    totalTransactions,
	}

	utils.RespondWithJSON(w, http.StatusOK, result)
}