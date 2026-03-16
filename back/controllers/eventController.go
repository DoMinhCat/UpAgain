package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"time"
)

// get general stats to show in event module's cards. Stats include:
//
// - total events
//
// - new events since last month (30 days)
//
// - upcoming events in next 30 days
//
// - total registrations since last month
//
// - total pending approvals for events
func GetEventStats(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	total, err := db.GetTotalCountActiveEvents()
	if err != nil {
		slog.Error("GetTotalCountActiveEvents() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	newEvents, err := db.GetEventIncreaseSince(time.Now().AddDate(0, -1, 0)) // get new events created since last month
	if err != nil {
		slog.Error("GetEventIncreaseSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	upcomingEvents, err := db.GetUpcomingEventIn(time.Now().AddDate(0, 1, 0)) // get upcoming events in next 30 days
	if err != nil {
		slog.Error("GetEventIncreaseSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	registrations, err := db.GetTotalRegistrationsSince(time.Now().AddDate(0, -1, 0)) // get total registrations since last month
	if err != nil {
		slog.Error("GetTotalRegistrationsSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	pendingApprovals, err := db.GetTotalEventsByStatus("pending")
	if err != nil {
		slog.Error("GetTotalEventsByStatus() failed", "controller", "GetEventStats", "status", "pending", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	stats := models.EventStats{
		Total:           total,
		NewEvents:       newEvents,
		UpcomingEvents:  upcomingEvents,
		Registrations:   registrations,
		PendingApprovals: pendingApprovals,
	}

	utils.RespondWithJSON(w, http.StatusOK, stats)
}