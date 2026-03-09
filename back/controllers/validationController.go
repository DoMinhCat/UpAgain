package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
)

func GetPendingValidations(w http.ResponseWriter, r *http.Request) {
	deposits, err := db.GetPendingDeposits()
	if err != nil {
		slog.Error("Failed to fetch pending deposits", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending deposits")
		return
	}

	listings, err := db.GetPendingListings()
	if err != nil {
		slog.Error("Failed to fetch pending listings", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending listings")
		return
	}

	events, err := db.GetPendingEvents()
	if err != nil {
		slog.Error("Failed to fetch pending events", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending events")
		return
	}

	response := struct {
		Deposits []models.PendingDepositResponse `json:"deposits"`
		Listings []models.PendingListingResponse `json:"listings"`
		Events   []models.PendingEventResponse   `json:"events"`
	}{
		Deposits: deposits,
		Listings: listings,
		Events:   events,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func parseValidationPayload(r *http.Request) (*models.ValidationActionRequest, string, error) {
	var payload models.ValidationActionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		return nil, "", err
	}

	var newStatus string
	if payload.Action == "approve" {
		newStatus = "approved"
	} else if payload.Action == "refuse" {
		if payload.Reason == "" {
			return nil, "", fmt.Errorf("reason is required for refusal")
		}
		newStatus = "refused"
	} else {
		return nil, "", fmt.Errorf("invalid action, must be approve or refuse")
	}

	return &payload, newStatus, nil
}

func ProcessListingValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	itemID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid listing ID")
		return
	}

	employeeID, ok := r.Context().Value("userID").(int)
	if !ok {
		slog.Error("Failed to extract employee ID from context")
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized to perform this action")
		return
	}

	payload, newStatus, err := parseValidationPayload(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.UpdateListingStatus(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("Failed to process listing validation", "error", err, "itemID", itemID)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during validation")
		return
	}

	//  TODO: Appel Fictif à l'API OneSignal pour notifier l'utilisateur
	if newStatus == "refused" {
		slog.Info("OneSignal Push: Listing refused", "reason", payload.Reason)
	} else {
		slog.Info("OneSignal Push: Listing approved")
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Listing status updated successfully"})
}

func ProcessDepositValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	itemID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID")
		return
	}

	employeeID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal, elle contiendra la raison du refus
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.ProcessDepositValidation(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("Failed to process deposit validation", "error", err, "itemID", itemID)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during deposit validation")
		return
	}

	// TODO: Notification OneSignal (et envoi du code-barres par email/push si approved)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Deposit processed successfully"})
}

func ProcessEventValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	eventID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event ID")
		return
	}

	employeeID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal, elle contiendra la raison du refus
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.UpdateEventStatus(eventID, newStatus, employeeID)
	if err != nil {
		slog.Error("Failed to process event validation", "error", err, "eventID", eventID)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during event validation")
		return
	}

	// TODO: Notification OneSignal au salarié qui a proposé l'atelier
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Event processed successfully"})
}
