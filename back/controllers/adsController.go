package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	validation "backend/utils/validations"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
)

// CreateAdsForProject godoc
// @Summary      Create an ad for a project
// @Description  Create a new advertisement for a specific project. Admin creates it for free, Pro users will need to pay (TODO).
// @Tags         ads
// @Accept       json
// @Produce      json
// @Param        body  body      models.CreateAdsRequest  true  "Create Ad payload"
// @Success      200   {string}  string  "Ad created successfully."
// @Failure      400   {object}  nil     "Invalid request body or project does not exist"
// @Failure      401   {object}  nil     "Unauthorized"
// @Failure      409   {object}  nil     "Project already has an active ad"
// @Failure      500   {object}  nil     "Internal server error"
// @Router       /ads/ [post]
func CreateAdsForProject(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	// get and validate request body
	var payload models.CreateAdsRequest
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		slog.Error("invalid JSON request body", "error", err)
		return
	}

	project_id := payload.IdPost
	exist, err := db.CheckPostExistsById(project_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating an ad for this project.")
		slog.Error("CheckPostExistsById() failed", "controller", "CreateAdsForProject", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Project with ID "+strconv.Itoa(project_id)+" does not exist.")
		return
	}

	projectDetails, err := db.GetPostDetailsById(project_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating an ad for this project.")
		slog.Error("GetPostDetailsById() failed", "controller", "CreateAdsForProject", "error", err)
		return
	}
	// if not admin then can only create ads for himself
	if role != "admin" && projectDetails.CreatorId != idRequestor {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
		return
	}
	// can't create if already have active ad
	if projectDetails.AdsId.Valid {
		utils.RespondWithError(w, http.StatusConflict, "Project already has an active ad.")
		return
	}

	// validate payload
	validationResponse := validation.ValidateCreateAdsRequest(payload)
	if !validationResponse.Success {
		utils.RespondWithError(w, validationResponse.Error, validationResponse.Message.Error())
		return
	}

	// for admin, create ads in db directly, no payment, price = 0
	if role == "admin" {
		idAds, err := db.CreateAds(payload, role)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating an ad for this project.")
			slog.Error("CreateAds() failed", "controller", "CreateAdsForProject", "error", err)
			return
		}

		newState := map[string]interface{}{
			"id": idAds,
			"id_post": project_id,
			"start_date": payload.From,
			"end_date":   payload.From.AddDate(0, payload.Duration, 0),
			"status": "active",
			"price_per_month": 0,
			"total_price": 0,
		}
		err = db.InsertHistory("ads", project_id, "create", idRequestor, nil, newState)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "CreateAdsForProject", "error", err)
		}
		utils.RespondWithJSON(w, http.StatusOK, "Ad created successfully.")
		return
	} else{
		// TODO: for pro need to do payment first then insert into db
	}
}

// UpdateAds godoc
// @Summary      Update an ad
// @Description  Update the start and end dates of an existing advertisement. Admin only.
// @Tags         ads
// @Accept       json
// @Produce      json
// @Param        ad_id  path      int                      true  "Ad ID"
// @Param        body   body      models.UpdateAdsRequest  true  "Update Ad payload"
// @Success      200    {string}  string                   "Ad updated successfully."
// @Failure      400    {object}  nil                      "Invalid Ad ID or request body"
// @Failure      401    {object}  nil                      "Unauthorized"
// @Failure      500    {object}  nil                      "Internal server error"
// @Router       /ads/{ad_id}/ [patch]
func UpdateAds(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	ad_id_str := r.PathValue("ad_id")
	if ad_id_str == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Ad ID missing.")
		return
	}
	ad_id, err := strconv.Atoi(ad_id_str)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid ad ID.")
		return
	}

	exist, err := db.CheckAdsExistsById(ad_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the ad.")
		slog.Error("CheckAdsExistsById() failed", "controller", "UpdateAds", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Ad with ID "+strconv.Itoa(ad_id)+" does not exist.")
		return
	}

	// get and validate request body
	var payload models.UpdateAdsRequest
	payload.IdAds = ad_id
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		slog.Error("invalid JSON request body", "error", err)
		return
	}

	validationResponse := validation.ValidateUpdateAdsRequest(payload)
	if !validationResponse.Success {
		utils.RespondWithError(w, validationResponse.Error, validationResponse.Message.Error())
		return
	}

	err = db.UpdateAdsByAdsId(payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating an ad.")
		slog.Error("UpdateAdsByAdsId() failed", "controller", "UpdateAds", "error", err)
		return
	}

	// insert history
	newState := map[string]interface{}{
		"id": payload.IdAds,
		"start_date": payload.From,
		"end_date":   payload.To,
	}
	err = db.InsertHistory("ads", payload.IdAds, "update", idRequestor, nil, newState)
	if err != nil {
		slog.Error("InsertHistory() failed", "controller", "UpdateAds", "error", err)
	}

	utils.RespondWithJSON(w, http.StatusOK, "Ad updated successfully.")
}

// DeleteAds godoc
// @Summary      Delete an ad
// @Description  Soft-delete (cancel) an existing advertisement by its ID. Admin can delete any ad, Pro users can only delete their own.
// @Tags         ads
// @Produce      json
// @Param        ad_id  path      int  true  "Ad ID"
// @Success      204    {object}  nil  "No Content"
// @Failure      400    {object}  nil  "Invalid Ad ID or ad does not exist"
// @Failure      401    {object}  nil  "Unauthorized"
// @Failure      500    {object}  nil  "Internal server error"
// @Router       /ads/{ad_id}/ [delete]
func DeleteAds(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	ad_id_str := r.PathValue("ad_id")
	if ad_id_str == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Ad ID missing.")
		return
	}
	ad_id, err := strconv.Atoi(ad_id_str)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid ad ID.")
		return
	}

	exist, err := db.CheckAdsExistsById(ad_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting the ad.")
		slog.Error("CheckAdsExistsById() failed", "controller", "DeleteAds", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Ad with ID "+strconv.Itoa(ad_id)+" does not exist.")
		return
	}

	adDetails, err := db.GetAdsById(ad_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting the ad.")
		slog.Error("GetAdsById() failed", "controller", "DeleteAds", "error", err)
		return
	}
	// if not admin then can only delete own ads
	if role != "admin" {
		postDetails, err := db.GetPostDetailsById(adDetails.IdPost)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting the ad.")
			slog.Error("GetPostDetailsById() failed", "controller", "DeleteAds", "error", err)
			return
		}
		if postDetails.CreatorId != idRequestor {
			utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
			return
		}
	}

	err = db.DeleteAdsByAdsId(ad_id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting an ad.")
		slog.Error("DeleteAdsByAdsId() failed", "controller", "DeleteAds", "error", err)
		return
	}

	// insert history
	if role == "admin"{
		err = db.InsertHistory("ads", adDetails.IdPost, "delete", idRequestor, adDetails, nil)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "DeleteAds", "error", err)
		}
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}