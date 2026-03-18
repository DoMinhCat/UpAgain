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

// parsePaginationAndFilters extracts page, limit, search, sort from query params.
// page and limit default to -1 (no pagination).
func parsePaginationAndFilters(r *http.Request) (page, limit int, filters db.ValidationFilters, err error) {
	page = -1
	limit = -1
	query := r.URL.Query()

	if pageStr := query.Get("page"); pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			return
		}
	}
	if limitStr := query.Get("limit"); limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			return
		}
	}
	filters = db.ValidationFilters{
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
	}
	return
}

// buildPaginatedResult computes last_page and returns a standardized map.
func buildPaginatedResult(page, limit, total int) map[string]interface{} {
	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}
	currentPage := page
	if page == -1 || limit == -1 {
		currentPage = 1
		lastPage = 1
	}
	return map[string]interface{}{
		"current_page":  currentPage,
		"last_page":     lastPage,
		"limit":         limit,
		"total_records": total,
	}
}

// GetPendingDepositsAdmin returns paginated pending deposits.
func GetPendingDepositsAdmin(w http.ResponseWriter, r *http.Request) {
	page, limit, filters, err := parsePaginationAndFilters(r)
	if err != nil {
		slog.Error("parsePaginationAndFilters failed", "controller", "GetPendingDepositsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid pagination parameters")
		return
	}

	deposits, total, err := db.GetPendingDeposits(page, limit, filters)
	if err != nil {
		slog.Error("GetPendingDeposits failed", "controller", "GetPendingDepositsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending deposits")
		return
	}

	result := buildPaginatedResult(page, limit, total)
	result["deposits"] = deposits
	utils.RespondWithJSON(w, http.StatusOK, result)
}

// GetPendingListingsAdmin returns paginated pending listings.
func GetPendingListingsAdmin(w http.ResponseWriter, r *http.Request) {
	page, limit, filters, err := parsePaginationAndFilters(r)
	if err != nil {
		slog.Error("parsePaginationAndFilters failed", "controller", "GetPendingListingsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid pagination parameters")
		return
	}

	listings, total, err := db.GetPendingListings(page, limit, filters)
	if err != nil {
		slog.Error("GetPendingListings failed", "controller", "GetPendingListingsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending listings")
		return
	}

	result := buildPaginatedResult(page, limit, total)
	result["listings"] = listings
	utils.RespondWithJSON(w, http.StatusOK, result)
}

// GetPendingEventsAdmin returns paginated pending events.
func GetPendingEventsAdmin(w http.ResponseWriter, r *http.Request) {
	page, limit, filters, err := parsePaginationAndFilters(r)
	if err != nil {
		slog.Error("parsePaginationAndFilters failed", "controller", "GetPendingEventsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid pagination parameters")
		return
	}

	events, total, err := db.GetPendingEvents(page, limit, filters)
	if err != nil {
		slog.Error("GetPendingEvents failed", "controller", "GetPendingEventsAdmin", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching pending events")
		return
	}

	result := buildPaginatedResult(page, limit, total)
	result["events"] = events
	utils.RespondWithJSON(w, http.StatusOK, result)
}

// GetValidationStats returns counts of pending/approved/refused for all entity types.
func GetValidationStats(w http.ResponseWriter, r *http.Request) {
	stats, err := db.GetValidationStats()
	if err != nil {
		slog.Error("GetValidationStats failed", "controller", "GetValidationStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching validation stats")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, stats)
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

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal
	if err != nil {
		slog.Error("parseValidationPayload failed", "controller", "ProcessDepositValidation", "error", err)
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

	_, newStatus, err := parseValidationPayload(r) // remplacer le _ lors de l'integration de OneSignal
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
