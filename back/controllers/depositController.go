package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

func GetDepositDetailsById(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}
	
	idStr := r.PathValue("deposit_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID.")
		return
	}

	exist, err := db.CheckItemExistByItemId(id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetDepositDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch deposit details.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Deposit not found.")
		return
	}

	deposit, err := db.GetDepositDetailsById(id)
	if err != nil {
		slog.Error("GetDepositDetailsById() failed", "controller", "GetDepositDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch deposit details.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, deposit)
}