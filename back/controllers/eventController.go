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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	newEvents, err := db.GetEventIncreaseSince(time.Now().AddDate(0, -1, 0)) // get new events created since last month
	if err != nil {
		slog.Error("GetEventIncreaseSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	upcomingEvents, err := db.GetUpcomingEventIn(time.Now().AddDate(0, 1, 0)) // get upcoming events in next 30 days
	if err != nil {
		slog.Error("GetEventIncreaseSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	registrations, err := db.GetTotalRegistrationsSince(time.Now().AddDate(0, -1, 0)) // get total registrations since last month
	if err != nil {
		slog.Error("GetTotalRegistrationsSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	status := "pending"
	pendingApprovals, err := db.GetTotalEventsByStatus(&status)
	if err != nil {
		slog.Error("GetTotalEventsByStatus() failed", "controller", "GetEventStats", "status", status, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	stats := models.EventStats{
		Total:            total,
		NewEvents:        newEvents,
		UpcomingEvents:   upcomingEvents,
		Registrations:    registrations,
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
			slog.Error("Atoi() failed", "controller", "GetAllEvents", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching events.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllEvents", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching events.")
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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching events.")
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
		Events:       events,
		CurrentPage:  page,
		LastPage:     lastPage,
		Limit:        limit,
		TotalRecords: total,
	}
	if page == -1 || limit == -1 {
		result.CurrentPage = 1
		result.LastPage = 1
	}
	utils.RespondWithJSON(w, http.StatusOK, result)
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	var err error
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee"{
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var event models.CreateEventRequest
	err = json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		slog.Debug("json.NewDecoder(r.Body).Decode() failed", "controller", "CreateEvent", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	// validations
	validation := validation.ValidateEventCreation(event)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	eventId, err := db.CreateEvent(event)
	if err != nil {
		slog.Error("CreateEvent() failed", "controller", "CreateEvent", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the event.")
		return
	}

	// assign employee to event automatically if request was sent from employee
	// if created by admin, employee is null
	if role == "employee" {
		err = db.AssignEmployeeToEvent(eventId, r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("AssignEmployeeToEvent() failed", "controller", "CreateEvent", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the event.")
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusCreated, nil)
}