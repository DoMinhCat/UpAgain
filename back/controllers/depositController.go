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

// GetPendingDepositsAdmin godoc
// @Summary      Get pending deposits
// @Description  Get a paginated list of pending deposits for admin
// @Tags         validation
// @Produce      json
// @Param        page    query     int     false  "Page number"
// @Param        limit   query     int     false  "Limit"
// @Param        search  query     string  false  "Search query"
// @Param        sort    query     string  false  "Sort order"
// @Success      200     {object}  map[string]interface{}  "Paginated deposits"
// @Failure      400     {object}  nil                     "Invalid pagination parameters"
// @Failure      500     {object}  nil                     "Internal server error"
// @Router       /admin/validations/deposits/ [get]
func GetPendingDepositsAdmin(w http.ResponseWriter, r *http.Request) {
	page, limit, filters, err := helper.ParsePaginationAndFilters(r)
	if err != nil {
		slog.Error("ParsePaginationAndFilters failed", "controller", "GetPendingDepositsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid pagination parameters")
		return
	}

	deposits, total, err := db.GetPendingDeposits(page, limit, filters)
	if err != nil {
		slog.Error("GetPendingDeposits failed", "controller", "GetPendingDepositsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending deposits")
		return
	}

	result := helper.BuildPaginatedResult(page, limit, total)
	result["deposits"] = deposits
	utils.RespondWithJSON(w, http.StatusOK, result)
}

// GetDepositCodesOfLatestTransactionByDepositId godoc
// @Summary      Get deposit codes for user and/or pro of the latest transaction
// @Description  Get deposit code of pro and user of the latest transaction for a deposit
// @Tags         deposit
// @Produce      json
// @Param        deposit_id    path     int     true  "Deposit ID"
// @Success      200     {object}  []models.CodeForAdmin  "Deposit codes and their status"
// @Failure      400     {object}  nil                     "Invalid deposit ID"
// @Failure      500     {object}  nil                     "Internal server error"
// @Router       /deposits/{deposit_id}/codes/ [get]
func GetDepositCodesOfLatestTransactionByDepositId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}
	depositId, err := strconv.Atoi(r.PathValue("deposit_id"))
	if err != nil {
		slog.Error("strconv.Atoi() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID")
		return
	}

	codes, err := db.GetCodesOfLatestTransactionByDepositId(depositId)
	if err != nil {
		slog.Error("db.GetCodesOfLatestTransactionByDepositId() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching deposit codes")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, codes)
}