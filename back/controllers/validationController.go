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
		slog.Error("GetPendingDeposits failed", "controller", "GetPendingValidations", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending deposits")
		return
	}

	listings, err := db.GetPendingListings()
	if err != nil {
		slog.Error("GetPendingListings failed", "controller", "GetPendingValidations", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending listings")
		return
	}

	events, err := db.GetPendingEvents()
	if err != nil {
		slog.Error("GetPendingEvents failed", "controller", "GetPendingValidations", "error", err)
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

// helper function, not a controller
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
		slog.Error("Atoi failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid listing ID")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessListingValidation")
		utils.RespondWithError(w, http.StatusUnauthorized, "Failed to read user claims")
		return
	}

	employeeID := claims.Id

	payload, newStatus, err := parseValidationPayload(r)
	if err != nil {
		slog.Error("parseValidationPayload failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.UpdateListingStatus(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("UpdateListingStatus failed", "controller", "ProcessListingValidation", "itemId", itemID, "error", err)
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
		slog.Error("Atoi failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessDepositValidation")
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to authenticate request")
		return
	}

	employeeID := claims.Id

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal, elle contiendra la raison du refus
	if err != nil {
		slog.Error("Atoi failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.ProcessDepositValidation(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("ProcessDepositValidation failed", "controller", "ProcessDepositValidation", "itemId", itemID, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during deposit validation")
		return
	}

	// TODO: Notification OneSignal (et envoi du code-barres par email/push si approved)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Deposit status updated successfully"})
}

func ProcessEventValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	eventID, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi failed", "controller", "ProcessEventValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event ID")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessEventValidation")
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to authenticate request")
		return
	}

	employeeID := claims.Id

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal, elle contiendra la raison du refus
	if err != nil {
		slog.Error("parseValidationPayload failed", "controller", "ProcessEventValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = db.UpdateEventStatus(eventID, newStatus, employeeID)
	if err != nil {
		slog.Error("UpdateEventStatus failed", "controller", "ProcessEventValidation", "eventId", eventID, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during event validation")
		return
	}

	// TODO: Notification OneSignal au salarié qui a proposé l'atelier
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Event status updated successfully"})
}

func GetItemsHistory(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "GetItemsHistory")
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to read user claims")
		return
	}

	if claims.Role != "admin" && claims.Role != "employee" {
		utils.RespondWithError(w, http.StatusForbidden, "You are not authorized to perform this request")
		return
	}

	items, err := db.GetAllItemsHistory()
	if err != nil {
		slog.Error("GetAllItemsHistory() failed", "controller", "GetItemsHistory", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items history")
		return
	}

	if items == nil {
		items = []models.AllItemResponse{}
	}
	utils.RespondWithJSON(w, http.StatusOK, items)
}
