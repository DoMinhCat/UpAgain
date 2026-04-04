package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

func GetListingDetails(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}
	
	idStr := r.PathValue("listing_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid listing ID.")
		return
	}

	exist, err := db.CheckItemExistByItemId(id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while checking the listing.")
		return
	}
	if !exist {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while checking the listing.")
		return
	}

	listing, err := db.GetListingDetailsById(id)
	if err != nil {
		slog.Error("GetListingDetailsById() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching listing's details.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, listing)
}