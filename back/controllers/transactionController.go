package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

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
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID " + strconv.Itoa(itemId) + " not found")
		return
	}

	transactions, err := db.GetTransactionsByItemId(itemId)
	if err != nil {
		slog.Error("GetTransactionsByItemId() failed", "controller", "GetItemTransactions", "item_id", itemId, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching object's transactions")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, transactions)
}

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
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID " + strconv.Itoa(itemId) + " not found")
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
		utils.RespondWithError(w, http.StatusNotFound, "Transaction with UUID " + transactionUuid + " not found")
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
		utils.RespondWithError(w, http.StatusConflict, "Transaction cannot be cancelled since current status is '" + currentStatus + "'")
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

	// Notification to user
	utils.RespondWithJSON(w, http.StatusOK, "Transaction cancelled successfully")
}