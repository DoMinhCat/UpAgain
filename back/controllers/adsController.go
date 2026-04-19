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

	// if not admin then can only create ads for himself
	if role != "admin" {
		projectDetails, err := db.GetPostDetailsById(project_id)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating an ad for this project.")
			slog.Error("GetPostDetailsById() failed", "controller", "CreateAdsForProject", "error", err)
			return
		}
		if projectDetails.CreatorId != idRequestor {
			utils.RespondWithError(w, http.StatusUnauthorized, "You are not allowed to perform this action.")
			return
		}
	}

	// validate start and end date
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
		// TODO: payment first then insert into db
	}
}