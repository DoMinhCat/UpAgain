package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"

	"github.com/google/uuid"
)

// GetNotificationOfAccount godoc
// @Summary      Get notifications of an account
// @Description  Get all notifications associated with the logged-in account
// @Tags         notifications
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200  {array}   models.NotificationDetail
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /notifications [get]
func GetNotificationOfAccount(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
		return
	}

	notifications, err := db.GetNotificationsByAccountId(claims.Id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching notifications.")
		slog.Error("GetNotificationsByAccountId() failed", "controller", "GetNotificationOfAccount", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, notifications)
}

// MarkNotificationAsRead godoc
// @Summary      Mark a notification as read
// @Description  Mark an existing notification as read by its UUID
// @Tags         notifications
// @Security     ApiKeyAuth
// @Produce      json
// @Param        noti_id  path      string  true  "Notification UUID"
// @Success      204      {object}  nil     "No Content"
// @Failure      400      {object}  nil     "Invalid Notification ID"
// @Failure      401      {object}  nil     "Unauthorized"
// @Failure      403      {object}  nil     "Forbidden"
// @Failure      500      {object}  nil     "Internal server error"
// @Router       /notifications/{noti_id}/read [patch]
func MarkNotificationAsRead(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
		return
	}

	notiIdStr := r.PathValue("noti_id")
	if notiIdStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Notification ID missing.")
		return
	}

	notiUuid, err := uuid.Parse(notiIdStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid notification ID format.")
		return
	}

	notiDetails, err := db.GetNotiDetailsByUuid(notiUuid)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching notification details.")
		slog.Error("GetNotiDetailsByUuid() failed", "controller", "MarkNotificationAsRead", "error", err)
		return
	}

	if notiDetails.IdAccount != claims.Id {
		utils.RespondWithError(w, http.StatusForbidden, "You lack the permissions to perform this action.")
		return
	}

	err = db.MarkNotiAsReadByUuid(notiIdStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the notification status.")
		slog.Error("MarkNotiAsReadByUuid() failed", "controller", "MarkNotificationAsRead", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// DeleteNotification godoc
// @Summary      Delete a notification
// @Description  Delete an existing notification by its UUID
// @Tags         notifications
// @Security     ApiKeyAuth
// @Produce      json
// @Param        noti_id  path      string  true  "Notification UUID"
// @Success      204      {object}  nil     "No Content"
// @Failure      400      {object}  nil     "Invalid Notification ID"
// @Failure      401      {object}  nil     "Unauthorized"
// @Failure      403      {object}  nil     "Forbidden"
// @Failure      500      {object}  nil     "Internal server error"
// @Router       /notifications/{noti_id} [delete]
func DeleteNotification(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
		return
	}

	notiIdStr := r.PathValue("noti_id")
	if notiIdStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Notification ID missing.")
		return
	}

	notiUuid, err := uuid.Parse(notiIdStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid notification ID format.")
		return
	}

	notiDetails, err := db.GetNotiDetailsByUuid(notiUuid)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching notification details.")
		slog.Error("GetNotiDetailsByUuid() failed", "controller", "DeleteNotification", "error", err)
		return
	}

	if notiDetails.IdAccount != claims.Id {
		utils.RespondWithError(w, http.StatusForbidden, "You lack the permissions to perform this action.")
		return
	}

	err = db.DeleteNotiByUuid(notiIdStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting the notification.")
		slog.Error("DeleteNotiByUuid() failed", "controller", "DeleteNotification", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}