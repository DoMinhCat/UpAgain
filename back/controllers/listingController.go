package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/helper"
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

// GetListingDetails godoc
// @Summary      Get listing details
// @Description  Get detailed information about a specific listing item, including city and postal code.
// @Tags         listing
// @Security     ApiKeyAuth
// @Produce      json
// @Param        listing_id  path      int  true  "Listing item ID"
// @Success      200         {object}  models.Listing  "Listing details"
// @Failure      400         {object}  nil             "Invalid ID"
// @Failure      404         {object}  nil             "Listing not found"
// @Failure      500         {object}  nil             "Internal server error"
// @Router       /listings/{listing_id}/ [get]
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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching the listing.")
		return
	}
	if !exist {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching the listing.")
		return
	}

	listing, err := db.GetListingDetailsById(id)
	if err != nil {
		slog.Error("GetListingDetailsById() failed", "controller", "GetListingDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while getting the listing.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, listing)
}

// UpdateListing godoc
// @Summary      Update listing
// @Description  Update an existing listing item's details and images. If updated by a user, status resets to pending for re-validation. User can only update their own listings.
// @Tags         listing
// @Security     ApiKeyAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        listing_id       path      int     true   "Listing item ID"
// @Param        title            formData  string  true   "Item title"
// @Param        description      formData  string  true   "Item description (HTML)"
// @Param        weight           formData  number  true   "Item weight"
// @Param        state            formData  string  true   "Item state (new, good, very_good, need_repair)"
// @Param        material         formData  string  true   "Item material (wood, metal, textile, glass, plastic, other, mixed)"
// @Param        price            formData  number  true   "Item price"
// @Param        city             formData  string  true   "City"
// @Param        postal_code      formData  string  true   "Postal code (5-9 digits)"
// @Param        existing_images  formData  string  false  "Paths of existing images to keep (multiple allowed)"
// @Param        new_images       formData  file    false  "New images to upload (multiple allowed)"
// @Success      204              {object}  nil     "No Content"
// @Failure      400              {object}  nil     "Invalid request"
// @Failure      401              {object}  nil     "Unauthorized"
// @Failure      404              {object}  nil     "Listing not found"
// @Failure      500              {object}  nil     "Internal server error"
// @Router       /listings/{listing_id}/ [put]
func UpdateListing(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" || role == "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
		return
	}
	
	idStr := r.PathValue("listing_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid listing ID.")
		return
	}

	exist, err := db.CheckItemExistByItemId(id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}
	if !exist {
		slog.Error("CheckItemExistByItemId() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}

	// user can only edit their own listings
	if role != "admin"{
		belongsToUser, err := db.CheckItemBelongsToUser(id, r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("CheckItemBelongsToUser() failed", "controller", "UpdateListing", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
			return
		}
		if !belongsToUser {
			utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action.")
			return
		}
	}

	// get old version
	listingDetails, err := db.GetListingDetailsById(id)
	if err != nil {
		slog.Error("GetListingDetailsById() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}
	itemDetails, err := db.GetItemDetailsByItemId(id)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}
	old_photos, err := db.GetPhotosPathsByObjectId(id, "item")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the listing.")
		return
	}
	// mapping
	listingFullDetails := models.ListingFullDetails{
		Title:       itemDetails.Title,
		Description: itemDetails.Description,
		Weight:      itemDetails.Weight,
		State:       itemDetails.State,
		IdUser:      itemDetails.IdUser,
		Material:    itemDetails.Material,
		Price:       itemDetails.Price,
		Status:      itemDetails.Status,
		City:        listingDetails.City,
		PostalCode:  listingDetails.PostalCode,
		Photos:      old_photos,
	}

	// form ingest and validation
	var payload models.UpdateListingRequest
	err = r.ParseMultipartForm(32 << 20) // 32MB limit
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "UpdateListing", "error", err)
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
		slog.Error("strconv.ParseFloat() failed", "controller", "UpdateListing", "error", err)
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
		slog.Error("strconv.ParseFloat() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}
	if payload.Price < 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}
	payload.City = r.FormValue("city")
	if strings.TrimSpace(payload.City) == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "City is required.")
		return
	}
	payload.PostalCode = r.FormValue("postal_code")
	match, _ := regexp.MatchString(`^\d{5,9}$`, payload.PostalCode)
	if strings.TrimSpace(payload.PostalCode) == "" || !match {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid postal code.")
		return
	}

	// handle photos
	keepImages := r.MultipartForm.Value["existing_images"]
	newImg := r.MultipartForm.File["new_images"]

	currentImages, err := db.GetPhotosPathsByObjectId(id, "item")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
		return
	}

	finalPhotos, delErrs, err := helper.ProcessPhotoUpdate("images/items", currentImages, keepImages, newImg)
	for _, delErr := range delErrs {
		slog.Error("ProcessPhotoUpdate() deletion failed", "controller", "UpdateListing", "error", delErr)
	}
	if err != nil {
		slog.Error("ProcessPhotoUpdate() save failed", "controller", "UpdateListing", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Error saving images.")
		return
	}
	payload.Photos = finalPhotos

	// if is user then require validation from admin again
	if role == "user"{
		err = db.UpdateItemStatusById(id, "pending")
		if err != nil {
			slog.Error("db.UpdateItemStatusById() failed", "controller", "UpdateListing", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
			return
		}
	}

	// update
    err = db.UpdateListingById(id, payload)
    if err != nil {
        slog.Error("db.UpdateListingById() failed", "controller", "UpdateListing", "error", err)
        utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update listing.")
        return
    }
	// admin history
	if role == "admin"{
		err = db.InsertHistory("listing", id, "update", r.Context().Value("user").(models.AuthClaims).Id, listingFullDetails, payload)
		if err != nil {
			slog.Error("db.InsertHistory() failed", "controller", "UpdateListing", "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}