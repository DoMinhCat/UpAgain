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