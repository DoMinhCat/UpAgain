package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/helper"
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
// @Param        timeframe  query     string  false  "Timeframe filter: today, last_3_days, last_week, last_month, last_year, all"
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

	var timeParam *time.Time
	timeUrl := r.URL.Query().Get("timeframe")
	if timeUrl != "" && timeUrl != "all" {
		var t time.Time
		switch timeUrl {
		case "today":
			t = time.Now().AddDate(0, 0, -1)
		case "last_3_days":
			t = time.Now().AddDate(0, 0, -3)
		case "last_week":
			t = time.Now().AddDate(0, 0, -7)
		case "last_month":
			t = time.Now().AddDate(0, -1, 0)
		case "last_year":
			t = time.Now().AddDate(-1, 0, 0)
		default:
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid timeframe.")
			return
		}
		timeParam = &t
	}

	total, err := db.GetTotalCountActiveEvents(timeParam)
	if err != nil {
		slog.Error("GetTotalCountActiveEvents() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	newEvents, err := db.GetEventIncreaseSince(timeParam)
	if err != nil {
		slog.Error("GetEventIncreaseSince() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	upcomingEvents, err := db.GetUpcomingEventIn(nil) // always show next 30 days regardless of timeframe
	if err != nil {
		slog.Error("GetUpcomingEventIn() failed", "controller", "GetEventStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching event stats.")
		return
	}

	registrations, err := db.GetTotalRegistrationsSince(timeParam)
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
// @Description  Create a new event from the provided multipart form data.
// @Tags         event
// @Accept       multipart/form-data
// @Produce      json
// @Param        title  formData  string                    true "Event title"
// @Param        description formData string              false "Event description"
// @Param        start_at    formData string              false "Start date (RFC3339 format)"
// @Param        end_at      formData string              false "End date (RFC3339 format)"
// @Param        price       formData number              false "Event price"
// @Param        category    formData string              false "Event category (workshop, conference, meetups, exposition, other)"
// @Param        capacity    formData integer             false "Max attendees"
// @Param        city        formData string              false "City"
// @Param        street      formData string              false "Street"
// @Param        location_detail formData string           false "Additional location details"
// @Param        images      formData file                false "Event images (multiple allowed)"
// @Success      201    {object}  nil                         "Event created successfully"
// @Failure      400    {object}  nil                         "Invalid payload or parsing error"
// @Failure      401    {object}  nil                         "Unauthorized"
// @Failure      500    {object}  nil                         "Internal server error"
// @Router       /events/ [post]
func CreateEvent(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var event models.CreateEventRequest
	err := r.ParseMultipartForm(32 << 20) // 32MB limit
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "CreateEvent", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}

	event.Title = r.FormValue("title")
	event.Description = r.FormValue("description")
	event.Category = r.FormValue("category")
	event.City = r.FormValue("city")
	event.Street = r.FormValue("street")
	event.Status = r.FormValue("status")

	if capacity, err := strconv.Atoi(r.FormValue("capacity")); err == nil {
		event.Capacity.SetValid(int64(capacity))
	}
	if price, err := strconv.ParseFloat(r.FormValue("price"), 64); err == nil {
		event.Price.SetValid(price)
	}
	if startAt, err := time.Parse(time.RFC3339, r.FormValue("start_at")); err == nil {
		event.StartAt.SetValid(startAt)
	}
	if endAt, err := time.Parse(time.RFC3339, r.FormValue("end_at")); err == nil {
		event.EndAt.SetValid(endAt)
	}
	event.LocationDetail.SetValid(r.FormValue("location_detail"))

	// Handle files
	files := r.MultipartForm.File["images"]
	for _, file := range files {
		path, err := helper.SaveUploadedFile(file, "images/events")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "CreateEvent", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Error saving images.")
			return
		}
		event.Images = append(event.Images, path)
	}

	// validations
	v := validation.ValidateEventCreation(event)
	if !v.Success {
		utils.RespondWithError(w, v.Error, v.Message.Error())
		return
	}

	eventId, err := db.CreateEvent(event, r.Context().Value("user").(models.AuthClaims).Id, role)
	if err != nil {
		slog.Error("CreateEvent() failed", "controller", "CreateEvent", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the event.")
		return
	}

	// Insert photos
	for i, imgPath := range event.Images {
		imagePayload := models.PhotoInsertRequest{
			Path:       imgPath,
			IsPrimary:  i == 0,
			ObjectType: "event",
			FkId:       eventId,
		}
		err = db.InsertImage(imagePayload)
		if err != nil {
			slog.Error("db.InsertImage() failed", "controller", "CreateEvent", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the event.")
			return
		}
	}

	// assign employee to event automatically if request was sent from employee
	if role == "employee" {
		err = db.AssignEmployeeToEvent(eventId, r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("AssignEmployeeToEvent() failed", "controller", "CreateEvent", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the event.")
			return
		}
	}

	if role == "admin" {
		db.InsertHistory("event", eventId, "create", r.Context().Value("user").(models.AuthClaims).Id, nil, event)
	}

	utils.RespondWithJSON(w, http.StatusCreated, nil)
}

// GetEventDetailsById godoc
// @Summary      Get event details
// @Description  Get detailed information about an event by its ID.
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        id        path      int  true  "Event ID"
// @Success      200       {object}  models.Event  "Event details retrieved successfully"
// @Failure      400       {object}  nil           "Invalid event ID"
// @Failure      404       {object}  nil           "Event not found"
// @Failure      500       {object}  nil           "Internal server error"
// @Router       /events/{id}/ [get]
func GetEventDetailsById(w http.ResponseWriter, r *http.Request) {
	id_url := r.PathValue("id")
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
// @Param        id        path      int  true  "Event ID"
// @Success      200       {array}   models.AssignedEmployee  "List of assigned employees"
// @Failure      400       {object}  nil                    "Invalid event ID"
// @Failure      401       {object}  nil                    "Unauthorized"
// @Failure      404       {object}  nil                    "Event not found"
// @Failure      500       {object}  nil                    "Internal server error"
// @Router       /events/employees/{id}/ [get]
func GetAssignedEmployeesByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id")
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
// @Param        id        path      int                     true  "Event ID"
// @Param        payload   body      models.AssignEmployeeRequest  true  "List of employee IDs"
// @Success      200       {object}  nil                    "Employees assigned successfully"
// @Failure      400       {object}  nil                    "Invalid payload or ID"
// @Failure      401       {object}  nil                    "Unauthorized"
// @Failure      404       {object}  nil                    "Event not found"
// @Failure      500       {object}  nil                    "Internal server error"
// @Router       /events/{id}/assign/ [post]
func AssignEmployeeToEventByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id")
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
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning event(s) to the event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	// check event is approved
	status, err := db.GetEventStatusById(id_event)
	if err != nil {
		slog.Error("GetEventStatusById() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning event(s) to the event.")
		return
	}
	if status != "approved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Event is not approved.")
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

	// can't assign admin
	for _, id_employee := range payload.IdsEmployee {
		isAdmin, err := db.CheckIsAdmin(id_employee)
		if err != nil {
			slog.Error("CheckIsAdmin() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning employee(s) to the event.")
			return
		}
		if isAdmin {
			utils.RespondWithError(w, http.StatusBadRequest, "An admin can't be assigned to an event.")
			return
		}
	}

	// check employee exists
	for _, id_employee := range payload.IdsEmployee {
		exist, err := db.CheckEmployeeExists(id_employee)
		if err != nil {
			slog.Error("CheckEmployeeExists() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning employee(s) to the event.")
			return
		}
		if !exist {
			utils.RespondWithError(w, http.StatusBadRequest, "Employee ID "+strconv.Itoa(id_employee)+" not found.")
			return
		}
	}

	// check employee has no conflict
	validIds := []int{}
	availableEmployees, err := db.GetAvailableEmployeesByTime(payload.StartAt, payload.EndAt)
	if err != nil {
		slog.Error("GetAvailableEmployeesByTime() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning employee(s) to the event.")
		return
	}
	for _, availableEmployee := range availableEmployees.Employees {
		validIds = append(validIds, availableEmployee.Id)
	}

	var valid bool
	for _, id_account := range payload.IdsEmployee {
		valid = false
		for _, validId := range validIds {
			if validId == id_account {
				valid = true
			}
		}
		if !valid {
			utils.RespondWithError(w, http.StatusBadRequest, "Employee ID "+strconv.Itoa(id_account)+" is not available.")
			return
		}
	}

	err = db.AssignEmployeeToEventByEventId(id_event, payload.IdsEmployee)
	if err != nil {
		slog.Error("AssignEmployeeToEvent() failed", "controller", "AssignEmployeeToEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while assigning employee(s) to the event.")
		return
	}

	if role == "admin" {
		db.InsertHistory("event", id_event, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"action": "assign_employees"}, payload)
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// UnAssignEmployeeByEventId godoc
// @Summary      Unassign employee from event
// @Description  Remove an employee assignment from an event by ID.
// @Tags         event
// @Produce      json
// @Param        id        path      int                             true  "Event ID"
// @Param        payload   body      models.UnAssignEmployeeRequest  true  "Employee ID to unassign"
// @Success      204       {object}  nil                             "Employee unassigned"
// @Failure      400       {object}  nil                             "Invalid payload or ID"
// @Failure      401       {object}  nil                             "Unauthorized"
// @Failure      404       {object}  nil                             "Event not found"
// @Failure      500       {object}  nil                             "Internal server error"
// @Router       /events/{id}/unassign/ [delete]
func UnAssignEmployeeByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "UnAssignEmployeeByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "UnAssignEmployeeByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while unassigning the employee from the event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	var payload models.UnAssignEmployeeRequest
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		slog.Debug("json.NewDecoder(r.Body).Decode() failed", "controller", "UnAssignEmployeeByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	err = db.UnAssignEmployeeByEventId(id_event, payload.IdEmployee)
	if err != nil {
		slog.Error("UnAssignEmployeeByEventId() failed", "controller", "UnAssignEmployeeByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while unassigning the employee from the event.")
		return
	}

	if role == "admin" {
		db.InsertHistory("event", id_event, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"action": "unassign_employee"}, payload)
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// CancelEventByEventId godoc
// @Summary      Update event status
// @Description  Update the status of an event (approve, refuse, cancel, or set to pending).
// @Tags         event
// @Accept       json
// @Produce      json
// @Param        id      path      int                           true  "Event ID"
// @Param        payload body      models.UpdateEventStatusRequest true  "Target status"
// @Success      204     {object}  nil                           "Status updated"
// @Failure      400     {object}  nil                           "Invalid status or ID"
// @Failure      401     {object}  nil                           "Unauthorized"
// @Failure      404     {object}  nil                           "Event not found"
// @Failure      500     {object}  nil                           "Internal server error"
// @Router       /events/{id}/status/ [patch]
func CancelEventByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CancelEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "CancelEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling the event.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	var payload models.UpdateEventStatusRequest
	oldStatus, _ := db.GetEventStatusById(id_event)
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		slog.Debug("json.NewDecoder(r.Body).Decode() failed", "controller", "CancelEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	if payload.Status != "cancelled" && payload.Status != "approved" && payload.Status != "refused" && payload.Status != "pending" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid status.")
		return
	}

	err = db.UpdateEventStatusByEventId(id_event, payload.Status, r.Context().Value("user").(models.AuthClaims).Id)
	if err != nil {
		slog.Error("UpdateEventStatusByEventId() failed", "controller", "CancelEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the event status.")
		return
	}

	if role == "admin" {
		db.InsertHistory("event", id_event, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": payload.Status})
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// UpdateEventByEventId godoc
// @Summary      Update event details
// @Description  Update the details of an existing event by its ID using multipart form data.
// @Tags         event
// @Accept       multipart/form-data
// @Produce      json
// @Param        id     path      int  true  "Event ID"
// @Param        title  formData  string                    false "Event title"
// @Param        description formData string              false "Event description"
// @Param        start_at    formData string              false "Start date (RFC3339 format)"
// @Param        end_at      formData string              false "End date (RFC3339 format)"
// @Param        price       formData number              false "Event price"
// @Param        category    formData string              false "Event category"
// @Param        capacity    formData integer             false "Max attendees"
// @Param        city        formData string              false "City"
// @Param        street      formData string              false "Street"
// @Param        location_detail formData string           false "Additional location details"
// @Param        existing_images formData string           false "List of existing image paths to keep (multiple allowed)"
// @Param        new_images  formData file                false "New event images to upload (multiple allowed)"
// @Success      204    {object}  nil                         "Event updated successfully"
// @Failure      400    {object}  nil                         "Invalid payload or ID"
// @Failure      401    {object}  nil                         "Unauthorized"
// @Failure      404    {object}  nil                         "Event not found"
// @Failure      500    {object}  nil                         "Internal server error"
// @Router       /events/{id}/update/ [put]
func UpdateEventByEventId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id_url := r.PathValue("id")
	if id_url == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing event id.")
		return
	}

	id_event, err := strconv.Atoi(id_url)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "UpdateEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event id.")
		return
	}

	exist, err := db.CheckEventExistsById(id_event)
	if err != nil {
		slog.Error("CheckEventExistsById() failed", "controller", "UpdateEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the event.")
		return
	}
	oldEvent, _ := db.GetEventDetailsById(id_event)
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Event not found.")
		return
	}

	var payload models.UpdateEventRequest
	err = r.ParseMultipartForm(32 << 20) // 32MB limit
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "UpdateEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing form.")
		return
	}

	payload.Title = r.FormValue("title")
	payload.Description = r.FormValue("description")
	payload.Category = r.FormValue("category")
	payload.City = r.FormValue("city")
	payload.Street = r.FormValue("street")

	if capacity, err := strconv.Atoi(r.FormValue("capacity")); err == nil {
		payload.Capacity.SetValid(int64(capacity))
	}
	if price, err := strconv.ParseFloat(r.FormValue("price"), 64); err == nil {
		payload.Price.SetValid(price)
	}
	if startAt, err := time.Parse(time.RFC3339, r.FormValue("start_at")); err == nil {
		payload.StartAt = startAt
	}
	if endAt, err := time.Parse(time.RFC3339, r.FormValue("end_at")); err == nil {
		payload.EndAt = endAt
	}
	payload.LocationDetail.SetValid(r.FormValue("location_detail"))

	// Handle photo update management
	keepImages := r.MultipartForm.Value["existing_images"]
	newImg := r.MultipartForm.File["new_images"]

	// 1. Handle deletion of removed physical files
	currentImages, err := db.GetPhotosPathsByObjectId(id_event, "event")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "UpdateEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update event.")
		return
	}

	for _, dbImg := range currentImages {
		isKept := false
		for _, keepPath := range keepImages {
			if dbImg == keepPath {
				isKept = true
				break
			}
		}
		if !isKept {
			err = helper.DeleteFileByPath("images/events", dbImg)
			if err != nil {
				slog.Error("helper.DeleteFileByPath() failed", "controller", "UpdateEventByEventId", "error", err)
			}
			// db.UpdateEventByEventId will handle the database side deletions
		}
	}

	// 2. Prepare payload images list (existing + new)
	payload.Images = keepImages
	for _, file := range newImg {
		path, err := helper.SaveUploadedFile(file, "images/events")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "UpdateEventByEventId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Error saving images.")
			return
		}
		payload.Images = append(payload.Images, path)
	}

	validation := validation.ValidateEventUpdate(payload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	// require validation again if employee
	if role == "employee" {
		err = db.UpdateEventStatusByEventId(id_event, "pending", r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("UpdateEventStatusByEventId() failed", "controller", "UpdateEventByEventId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the event.")
			return
		}
	}

	err = db.UpdateEventByEventId(id_event, payload)
	if err != nil {
		slog.Error("UpdateEventByEventId() failed", "controller", "UpdateEventByEventId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating the event.")
		return
	}

	if role == "admin" {
		db.InsertHistory("event", id_event, "update", r.Context().Value("user").(models.AuthClaims).Id, oldEvent, payload)
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}
