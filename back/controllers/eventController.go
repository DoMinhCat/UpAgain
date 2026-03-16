package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
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

	status := "pending"
	pendingApprovals, err := db.GetTotalEventsByStatus(&status)
	if err != nil {
		slog.Error("GetTotalEventsByStatus() failed", "controller", "GetEventStats", "status", status, "error", err)
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

func GetAllEvents(w http.ResponseWriter, r *http.Request) {
	var err error
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	// default pagination
	page := -1
	limit := -1
	
	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching events.")
			slog.Error("Atoi() failed", "controller", "GetAllEvents", "error", err)
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching events.")
			slog.Error("Atoi() failed", "controller", "GetAllEvents", "error", err)
			return
		}
	}
	
	filters := models.EventFilters{
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
		Status: query.Get("status"),
	}

	events, total, err := db.GetAllEvents(page, limit, filters)
	if err != nil {
		slog.Error("GetAllEvents() failed", "controller", "GetAllEvents", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}
	
	result := models.EventsListPagination{
		Events:      events,
		CurrentPage:  page,
		LastPage:     lastPage,
		Limit:         limit,
		TotalRecords: total,
	}
	if page == -1 || limit == -1 {
		result.CurrentPage = 1
		result.LastPage = 1
	}
	utils.RespondWithJSON(w, http.StatusOK, result)
}