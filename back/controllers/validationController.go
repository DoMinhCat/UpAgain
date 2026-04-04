package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	helper "backend/utils/helper"
	"log/slog"
	"net/http"
	"strconv"
)

// GetValidationStats godoc
// @Summary      Get validation stats
// @Description  Get counts of pending, approved, and refused for all entity types
// @Tags         validation
// @Produce      json
// @Success      200  {object}  models.ValidationStats  "Validation stats"
// @Failure      500  {object}  nil                     "Internal server error"
// @Router       /admin/validations/stats/ [get]
func GetValidationStats(w http.ResponseWriter, r *http.Request) {
	stats, err := db.GetValidationStats()
	if err != nil {
		slog.Error("GetValidationStats failed", "controller", "GetValidationStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching validation stats")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, stats)
}

// ProcessListingValidation godoc
// @Summary      Process listing validation
// @Description  Approve or refuse a listing
// @Tags         validation
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Listing ID"
// @Param        body  body      models.ValidationActionRequest  true  "Validation decision"
// @Success      200   {object}  map[string]string  "Listing status updated successfully"
// @Failure      400   {object}  nil                "Invalid ID or payload"
// @Failure      401   {object}  nil                "Unauthorized"
// @Failure      500   {object}  nil                "Internal server error"
// @Router       /admin/validations/listings/{id}/ [put]
func ProcessListingValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	itemID, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid listing ID")
		return
	}

	exists, err := db.CheckItemExistByItemId(itemID)
	if err != nil {
		slog.Error("CheckItemExistByItemId failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while checking listing existence")
		return
	}
	if !exists {
		slog.Error("CheckItemExistByItemId failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusNotFound, "Listing not found")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessListingValidation")
		utils.RespondWithError(w, http.StatusUnauthorized, "Failed to read user claims")
		return
	}

	employeeID := claims.Id

	payload, newStatus, err := helper.ParseValidationPayload(r)
	if err != nil {
		slog.Error("ParseValidationPayload failed", "controller", "ProcessListingValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	oldStatus, _ := db.GetListingStatusById(itemID)
	err = db.UpdateListingStatus(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("UpdateListingStatus failed", "controller", "ProcessListingValidation", "itemId", itemID, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during validation")
		return
	}

	if claims.Role == "admin" {
		err = db.InsertHistory("listing", itemID, "update", claims.Id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": newStatus, "reason": payload.Reason})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "ProcessListingValidation", "itemId", itemID, "error", err)
		}
	}

	//  TODO: Appel Fictif à l'API OneSignal pour notifier l'utilisateur
	if newStatus == "refused" {
		slog.Info("OneSignal Push: Listing refused", "reason", payload.Reason)
	} else {
		slog.Info("OneSignal Push: Listing approved")
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Listing status updated successfully"})
}

// ProcessDepositValidation godoc
// @Summary      Process deposit validation
// @Description  Approve or refuse a deposit
// @Tags         validation
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Deposit ID"
// @Param        body  body      models.ValidationActionRequest  true  "Validation decision"
// @Success      200   {object}  map[string]string  "Deposit status updated successfully"
// @Failure      400   {object}  nil                "Invalid ID or payload"
// @Failure      500   {object}  nil                "Internal server error"
// @Router       /admin/validations/deposits/{id}/ [put]
func ProcessDepositValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	itemID, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID")
		return
	}

	exists, err := db.CheckItemExistByItemId(itemID)
	if err != nil {
		slog.Error("CheckItemExistByItemId failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while checking deposit existence")
		return
	}
	if !exists {
		slog.Error("CheckItemExistByItemId failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusNotFound, "Deposit not found")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessDepositValidation")
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to authenticate request")
		return
	}

	employeeID := claims.Id

	_, newStatus, err := helper.ParseValidationPayload(r) // remplacer le _ par une variable lors de l'integration de OneSignal
	if err != nil {
		slog.Error("ParseValidationPayload failed", "controller", "ProcessDepositValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	oldStatus, _ := db.GetItemStatusByItemId(itemID)
	err = db.ProcessDepositValidation(itemID, newStatus, employeeID)
	if err != nil {
		slog.Error("ProcessDepositValidation failed", "controller", "ProcessDepositValidation", "itemId", itemID, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during deposit validation")
		return
	}

	if claims.Role == "admin" {
		err = db.InsertHistory("deposit", itemID, "update", claims.Id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": newStatus})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "ProcessDepositValidation", "itemId", itemID, "error", err)
		}
	}

	// TODO: Notification OneSignal (et envoi du code-barres par email/push si approved)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Deposit status updated successfully"})
}

// ProcessEventValidation godoc
// @Summary      Process event validation
// @Description  Approve or refuse an event
// @Tags         validation
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Event ID"
// @Param        body  body      models.ValidationActionRequest  true  "Validation decision"
// @Success      200   {object}  map[string]string  "Event status updated successfully"
// @Failure      400   {object}  nil                "Invalid ID or payload"
// @Failure      404   {object}  nil                "Event not found"
// @Failure      500   {object}  nil                "Internal server error"
// @Router       /admin/validations/events/{id}/ [put]
func ProcessEventValidation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	eventID, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi failed", "controller", "ProcessEventValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event ID")
		return
	}

	exist, err := db.CheckEventExistsById(eventID)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "ProcessEventValidation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		slog.Error("r.Context().Value failed", "controller", "ProcessEventValidation")
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to authenticate request")
		return
	}

	employeeID := claims.Id

	_, newStatus, err := helper.ParseValidationPayload(r) // remplacer le _ lors de l'integration de OneSignal
	if err != nil {
		slog.Error("ParseValidationPayload failed", "controller", "ProcessEventValidation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	oldStatus, _ := db.GetEventStatusById(eventID)
	err = db.UpdateEventStatusByEventId(eventID, newStatus, employeeID)
	if err != nil {
		slog.Error("UpdateEventStatusByEventId() failed", "controller", "ProcessEventValidation", "eventId", eventID, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred during event validation")
		return
	}

	if claims.Role == "admin" {
		err = db.InsertHistory("event", eventID, "update", claims.Id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": newStatus})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "ProcessEventValidation", "eventId", eventID, "error", err)
		}
	}

	// TODO: Notification OneSignal au salarié qui a proposé l'atelier
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Event status updated successfully"})
}

// GetItemsHistory godoc
// @Summary      Get items history
// @Description  Get a paginated history of all items
// @Tags         validation
// @Produce      json
// @Param        page    query     int     false  "Page number"
// @Param        limit   query     int     false  "Limit"
// @Param        search  query     string  false  "Search query"
// @Param        sort    query     string  false  "Sort order"
// @Param        status  query     string  false  "Filter by status"
// @Param        type    query     string  false  "Filter by type"
// @Success      200     {object}  models.PaginatedHistoryResponse  "Paginated items history"
// @Failure      400     {object}  nil                              "Invalid pagination parameters"
// @Failure      403     {object}  nil                              "Forbidden"
// @Failure      500     {object}  nil                              "Internal server error"
// @Router       /admin/items/history/ [get]
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

	page, limit, filters, err := helper.ParsePaginationAndFilters(r)
	if err != nil {
		slog.Error("ParsePaginationAndFilters failed", "controller", "GetItemsHistory", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid pagination parameters")
		return
	}

	items, total, err := db.GetAllItemsHistory(page, limit, filters)
	if err != nil {
		slog.Error("GetAllItemsHistory() failed", "controller", "GetItemsHistory", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items history")
		return
	}

	result := helper.BuildPaginatedResult(page, limit, total)
	result["items"] = items
	utils.RespondWithJSON(w, http.StatusOK, result)
}
