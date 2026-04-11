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
// @Description  Get paginated transactions for a specific item (admin/pro/user owner)
// @Tags         transaction
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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching object's transactions")
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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching object's transactions")
		return
	}

	total, err := db.GetTotalTransactionsByItemId(itemId)
	if err != nil {
		slog.Error("GetTotalTransactionsByItemId() failed", "controller", "GetItemTransactions", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching object's transactions")
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

// CancelTransaction godoc
// @Summary      Cancel transaction
// @Description  Cancel an active reserved transaction for an item
// @Tags         transaction
// @Produce      json
// @Param        item_id           path      int     true  "Item ID"
// @Param        transaction_uuid  path      string  true  "Transaction UUID"
// @Success      200               {object}  nil     "Transaction cancelled successfully"
// @Failure      400               {object}  nil     "Invalid parameters"
// @Failure      401               {object}  nil     "Unauthorized"
// @Failure      404               {object}  nil     "Transaction or item not found"
// @Failure      409               {object}  nil     "Transaction cannot be cancelled"
// @Failure      500               {object}  nil     "Internal server error"
// @Router       /items/{item_id}/transactions/{transaction_uuid}/cancel/ [post]
func CancelTransaction(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" || role == "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action")
		return
	}

	itemId, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CancelTransaction", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID")
		return
	}

	exist, err := db.CheckItemExistByItemId(itemId)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "CancelTransaction", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while cancelling transaction")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+strconv.Itoa(itemId)+" not found")
		return
	}

	transactionUuid := r.PathValue("transaction_uuid")
	if transactionUuid == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid transaction UUID")
		return
	}

	exist, err = db.CheckTransactionExistByUuid(transactionUuid)
	if err != nil {
		slog.Error("CheckTransactionExistByUuid() failed", "controller", "CancelTransaction", "transaction_uuid", transactionUuid, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while cancelling transaction")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Transaction with UUID "+transactionUuid+" not found")
		return
	}

	// can only cancel if current status is reserved
	currentStatus, err := db.GetTransactionLatestStatusByUuid(transactionUuid)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByUuid() failed", "controller", "CancelTransaction", "transaction_uuid", transactionUuid, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while cancelling transaction")
		return
	}

	if currentStatus != "reserved" {
		utils.RespondWithError(w, http.StatusConflict, "Transaction cannot be cancelled since the transaction's current status is '"+currentStatus+"'")
		return
	}

	idPro, err := db.GetProIdByTransUuid(transactionUuid)
	if err != nil {
		slog.Error("GetProIdByTransUuid() failed", "controller", "CancelTransaction", "transaction_uuid", transactionUuid, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while cancelling transaction")
		return
	}
	err = db.CancelTransactionByUuid(transactionUuid, itemId, idPro)
	if err != nil {
		slog.Error("CancelTransactionByUuid() failed", "controller", "CancelTransaction", "transaction_uuid", transactionUuid, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while cancelling transaction")
		return
	}

	if role == "admin" {
		err = db.InsertHistory("transaction", transactionUuid, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"id_item": itemId, "action": currentStatus}, map[string]interface{}{"id_item": itemId, "action": "cancelled"})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "CancelTransaction", "transaction_uuid", transactionUuid, "error", err)
		}
	}

	// Notification to user
	utils.RespondWithJSON(w, http.StatusOK, "Transaction cancelled successfully")
}
