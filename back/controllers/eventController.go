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

// GetEventStats godoc
// @Summary      Get event stats
// @Description  Get general stats of events to show in event module's cards. Stats include:
// @Description  - total events
// @Description  - new events since last month (30 days)
// @Description  - upcoming events in next 30 days
// @Description  - total registrations since last month
// @Description  - total pending approvals for events
// @Tags         event
// @Accept       json
// @Produce      json
// @Success      200   {object}  models.EventStats  "Event stats retrieved successfully"
// @Failure      400   {object}  nil                "Invalid ID or payload"
// @Failure      500   {object}  nil                "Internal server error"
// @Router       /events/count/ [get]
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

// GetAllEvents godoc
// @Summary      Get all events
// @Description  Get list of all events with pagination, search, status and sort filters.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        page    query     int     false  "Current page number (default 1)"
// @Param        limit   query     int     false  "Number of events per page (default all)"
// @Param        search  query     string  false  "Search in title or city"
// @Param        status  query     string  false  "Filter by status: pending, approved, refused"
// @Param        sort    query     string  false  "Sort by field"
// @Success      200     {object}  models.EventsListPagination  "Events list retrieved successfully"
// @Failure      400     {object}  nil                          "Invalid query parameters"
// @Failure      401     {object}  nil                          "Unauthorized"
// @Failure      500     {object}  nil                          "Internal server error"
// @Router       /events/ [get]
func GetAllEvents(w http.ResponseWriter, r *http.Request) {
	var err error
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

// CreateEvent godoc
// @Summary      Create new event
// @Description  Create a new event from the provided payload.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        event  body      models.CreateEventRequest  true  "Event details"
// @Success      201    {object}  nil                         "Event created successfully"
// @Failure      400    {object}  nil                         "Invalid payload"
// @Failure      401    {object}  nil                         "Unauthorized"
// @Failure      500    {object}  nil                         "Internal server error"
// @Router       /events/ [post]
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

// GetEventDetailsById godoc
// @Summary      Get event details
// @Description  Get detailed information about an event by its ID.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        id_event  path      int  true  "Event ID"
// @Success      200       {object}  models.Event  "Event details retrieved successfully"
// @Failure      400       {object}  nil           "Invalid event ID"
// @Failure      404       {object}  nil           "Event not found"
// @Failure      500       {object}  nil           "Internal server error"
// @Router       /events/{id_event}/ [get]
func GetEventDetailsById(w http.ResponseWriter, r *http.Request) {
	id_url := r.PathValue("id_event")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetEventDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "GetEventDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	eventDetails, err := db.GetEventDetailsById(id_event)
	if err != nil {
		slog.Error("GetEventDetailsById() failed", "controller", "GetEventDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event details.")
		return
	}

	
	utils.RespondWithJSON(w, http.StatusOK, eventDetails)
}

// GetAssignedEmployeesByEventId godoc
// @Summary      Get assigned employees
// @Description  Get list of employees assigned to an event by ID.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        id_event  path      int  true  "Event ID"
// @Success      200       {array}   models.AssignedEmployee  "List of assigned employees"
// @Failure      400       {object}  nil                    "Invalid event ID"
// @Failure      401       {object}  nil                    "Unauthorized"
// @Failure      404       {object}  nil                    "Event not found"
// @Failure      500       {object}  nil                    "Internal server error"
// @Router       /events/employees/{id_event}/ [get]
func GetAssignedEmployeesByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id_event")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetAssignedEmployeesByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	employees, err := db.GetAssignedEmployeesByEventId(id_event)
	if err != nil {
		slog.Error("GetAssignedEmployeesByEventId() failed", "controller", "GetAssignedEmployeesByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching assigned employees.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, employees)
}

// AssignEmployeeToEventByEventId godoc
// @Summary      Assign employees to event
// @Description  Assign a list of employees to an event by its ID. Replaces existing assignments.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        id_event  path      int                     true  "Event ID"
// @Param        payload   body      models.AssignEmployeeRequest  true  "List of employee IDs"
// @Success      200       {object}  nil                    "Employees assigned successfully"
// @Failure      400       {object}  nil                    "Invalid payload or ID"
// @Failure      401       {object}  nil                    "Unauthorized"
// @Failure      404       {object}  nil                    "Event not found"
// @Failure      500       {object}  nil                    "Internal server error"
// @Router       /events/{id_event}/assign/ [post]
func AssignEmployeeToEventByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee"{
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id_event")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	var payload models.AssignEmployeeRequest
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		slog.Debug("json.NewDecoder(r.Body).Decode() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	// employee can only self assign
	if role != "admin" && len(payload.IdsEmployee) > 1 {
		utils.RespondWithError(w, http.StatusUnauthorized, "You can only assign yourself to an event.")
		return
	}

	// TODO: check employee exists
	// TODO: check employee has no conflict

	err = db.AssignEmployeeToEventByEventId(id_event, payload.IdsEmployee)
	if err != nil {
		slog.Error("AssignEmployeeToEvent() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning the employee to the event.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, nil)
}