package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/helper"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
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

func UpdateDepositByDepositId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" || role == "pro" {
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
		slog.Error("CheckItemExistByItemId() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch deposit details.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Deposit not found.")
		return
	}

	// user can only edit their own deposits
	if role != "admin"{
		belongsToUser, err := db.CheckItemBelongsToUser(id, r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("CheckItemBelongsToUser() failed", "controller", "UpdateDepositByDepositId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the deposit.")
			return
		}
		if !belongsToUser {
			utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
			return
		}
	}

	// if completed or reservedthen can't update
	status, err := db.GetItemStatusByItemId(id)
	if err != nil {
		slog.Error("GetItemStatusByItemId() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the deposit.")
		return
	}
	if status == "completed" || status == "reserved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Deposit is completed or reserved and cannot be updated.")
		return
	}

	// get old version
	depositDetails, err := db.GetDepositDetailsById(id)
	if err != nil {
		slog.Error("GetDepositDetailsById() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the deposit.")
		return
	}
	itemDetails, err := db.GetItemDetailsByItemId(id)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}
	oldPhotos, err := db.GetPhotosPathsByObjectId(id, "item")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the deposit.")
		return
	}
	// mapping for history insertion
	depositFullDetails := models.DepositFullDetails{
		Title:       itemDetails.Title,
		Description: itemDetails.Description,
		Weight:      itemDetails.Weight,
		State:       itemDetails.State,
		IdUser:      itemDetails.IdUser,
		Material:    itemDetails.Material,
		Price:       itemDetails.Price,
		Status:      itemDetails.Status,
		Photos:      oldPhotos,
		IdContainer: depositDetails.ContainerId,
	}

	// form ingest and validation
	var payload models.UpdateDepositRequest
	err = r.ParseMultipartForm(32 << 20) // 32MB limit
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing form.")
		return
	}

	payload.Title = r.FormValue("title")
	if strings.TrimSpace(payload.Title) == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Title is required.")
		return
	}
	payload.Description = r.FormValue("description")
	if strings.TrimSpace(payload.Description) == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Description is required.")
		return
	}
	payload.Weight, err = strconv.ParseFloat(r.FormValue("weight"), 64)
	if err != nil {
		slog.Error("strconv.ParseFloat() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid weight.")
		return
	}
	payload.State = r.FormValue("state")
	if strings.TrimSpace(payload.State) == "" || (payload.State != "new" && payload.State != "good" && payload.State != "very_good" && payload.State != "need_repair") {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid state.")
		return
	}
	payload.Material = r.FormValue("material")
	if strings.TrimSpace(payload.Material) == "" || (payload.Material != "wood" && payload.Material != "metal" && payload.Material != "textile" && payload.Material != "glass" && payload.Material != "plastic" && payload.Material != "other" && payload.Material != "mixed") {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid material.")
		return
	}
	payload.Price, err = strconv.ParseFloat(r.FormValue("price"), 64)
	if err != nil {
		slog.Error("strconv.ParseFloat() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}
	if payload.Price < 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}

	// handle photos
	keepImages := r.MultipartForm.Value["existing_images"]
	newImg := r.MultipartForm.File["new_images"]

	currentImages, err := db.GetPhotosPathsByObjectId(id, "item")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
		return
	}

	finalPhotos, delErrs, err := helper.ProcessPhotoUpdate("images/items", currentImages, keepImages, newImg)
	for _, delErr := range delErrs {
		slog.Error("ProcessPhotoUpdate() deletion failed", "controller", "UpdateDepositByDepositId", "error", delErr)
	}
	if err != nil {
		slog.Error("ProcessPhotoUpdate() save failed", "controller", "UpdateDepositByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Error saving images.")
		return
	}
	payload.Photos = finalPhotos

	// if is user then require validation from admin again and invalidate barcode
	if role == "user"{
		err = db.UpdateItemStatusById(id, "pending")
		if err != nil {
			slog.Error("db.UpdateItemStatusById() failed", "controller", "UpdateDepositByDepositId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
			return
		}

		// TODO: invalidate barcode of this deposit
	}

	// update
    err = db.UpdateDepositById(id, payload)
    if err != nil {
        slog.Error("db.UpdateDepositById() failed", "controller", "UpdateDepositByDepositId", "error", err)
        utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
        return
    }
	// admin history
	if role == "admin"{
		err = db.InsertHistory("deposit", id, "update", r.Context().Value("user").(models.AuthClaims).Id, depositFullDetails, payload)
		if err != nil {
			slog.Error("db.InsertHistory() failed", "controller", "UpdateDepositByDepositId", "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}