package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

// GetItemTransactions godoc
// @Summary      Get transactions for an item
// @Description  Get paginated transactions for a specific item (admin/user)
// @Tags         transaction
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int     true   "Item ID"
// @Param        page     query     int     false  "Page number"
// @Param        limit    query     int     false  "Limit per page"
// @Success      200      {object}  models.TransactionsPaginationResponse
// @Failure      400      {object}  nil     "Invalid parameters"
// @Failure      401      {object}  nil     "Unauthorized"
// @Failure      404      {object}  nil     "Item not found"
// @Failure      500      {object}  nil     "Internal server error"
// @Router       /items/{item_id}/transactions/ [get]
func GetItemTransactions(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action")
		return
	}

	itemId, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetItemTransactions", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID")
		return
	}

	exist, err := db.CheckItemExistByItemId(itemId)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetItemTransactions", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching object's transactions")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+strconv.Itoa(itemId)+" not found")
		return
	}

	// pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetItemTransactions", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching transactions.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetItemTransactions", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching transactions.")
			return
		}
	}

	transactions, err := db.GetTransactionsByItemId(itemId, page, limit)
	if err != nil {
		slog.Error("GetTransactionsByItemId() failed", "controller", "GetItemTransactions", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching object's transactions")
		return
	}

	total, err := db.GetTotalTransactionsByItemId(itemId)
	if err != nil {
		slog.Error("GetTotalTransactionsByItemId() failed", "controller", "GetItemTransactions", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching object's transactions")
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	response := models.TransactionsPaginationResponse{
		TotalTransactions: total,
		Transactions:      transactions,
		CurrentPage:       page,
		LastPage:          lastPage,
		Limit:             limit,
	}
	if page == -1 || limit == -1 {
		response.CurrentPage = 1
		response.LastPage = 1
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetLatestTransaction godoc
// @Summary      Get latest transaction of a pro for an item
// @Description  Returns the latest transaction record associated with a professional and a specific item.
// @Tags         transaction
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Success      200      {object}  models.Transaction
// @Failure      400      {object}  nil   "Invalid ID"
// @Failure      404      {object}  nil   "Item not found"
// @Failure      500      {object}  nil   "Internal server error"
// @Router       /items/{item_id}/transactions/latest [get]
func GetLatestTransaction(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id
	itemId, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetLatestTransaction", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID")
		return
	}

	exist, err := db.CheckItemExistByItemId(itemId)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetLatestTransaction", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching object's latest transaction")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+strconv.Itoa(itemId)+" not found")
		return
	}

	transaction, err := db.GetLatestTransactionOfPro(idRequestor, itemId)
	if err != nil {
		slog.Error("GetLatestTransactionOfPro() failed", "controller", "GetLatestTransaction", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching object's latest transaction")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, transaction)
}
