package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/geocode"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// GetAllContainersHandler godoc
// @Summary      Get all containers
// @Description  Get a list of all containers
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        page    query     int     false  "Page number"
// @Param        limit   query     int     false  "Limit"
// @Param        search  query     string  false  "Search query"
// @Param        status  query     string  false  "Filter by status"
// @Success      200  {object}   models.ContainerListPagination
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /containers/ [get]
func GetAllContainersHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	page := -1
	limit := -1

	pageStr := query.Get("page")
	if pageStr != "" {
		var err error
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid page parameter.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid limit parameter.")
			return
		}
	}

	filters := models.ContainerFilters{
		Search: query.Get("search"),
		Status: query.Get("status"),
	}

	containers, total, err := db.GetAllContainers(page, limit, filters)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching containers.")
		slog.Error("GetAllContainers() failed", "controller", "GetAllContainersHandler", "error", err)
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.ContainerListPagination{
		Containers:   containers,
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

// GetContainerByID godoc
// @Summary      Get container by ID
// @Description  Get a single container by its ID
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id   path      int  true  "Container ID"
// @Success      200  {object}  models.Container
// @Failure      400  {string}  string  "Invalid ID"
// @Failure      404  {string}  string  "Container not found"
// @Router       /containers/{id}/ [get]
func GetContainerByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	exist, err := db.CheckContainerExistById(id)
	if err != nil {
		slog.Error("CheckContainerExistById() failed", "controller", "GetContainerByID", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Container not found")
		return
	}

	container, err := db.FindContainerByID(id)
	if err != nil {
		slog.Error("FindContainerByID() failed", "controller", "GetContainerByID", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container.")
		return
	}

	// get current deposit
	if container.Status == "occupied" || container.Status == "waiting" {
		depoId, depoTitle, err := db.GetCurrentDepositByContainerId(id)
		if err != nil {
			slog.Error("GetCurrentDepositByContainerId() failed", "controller", "GetContainerByID", "id", id, "error", err)
			http.Error(w, "Container not found", http.StatusNotFound)
			return
		}
		if depoId != 0 {
			container.CurrentDepositId = depoId
			container.CurrentDepositTitle = depoTitle
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, container)
}

// UpdateContainerStatus godoc
// @Summary      Update container status
// @Description  Update the status of a container. Can't update if status is waiting or occupied.
// @Tags         container
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Container ID"
// @Param        body  body      models.UpdateStatusRequest  true  "New status payload"
// @Success      204   {object}  nil     "No Content"
// @Failure      401   {object}  nil     "Unauthorized"
// @Failure      500   {string}  string  "Internal error"
// @Router       /containers/{id}/ [put]
func UpdateContainerStatus(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}
	id, _ := strconv.Atoi(r.PathValue("id"))

	var payload models.UpdateStatusRequest
	json.NewDecoder(r.Body).Decode(&payload)

	if payload.Status != "ready" && payload.Status != "maintenance" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid status.")
		return
	}

	oldContainer, _ := db.FindContainerByID(id)
	if oldContainer.Status == "waiting" || oldContainer.Status == "occupied" {
		utils.RespondWithError(w, http.StatusConflict, "Container is waiting for an object or being occupied.")
		return
	}

	if err := db.UpdateStatusContainer(id, payload.Status); err != nil {
		slog.Error("UpdateStatusContainer() failed", "controller", "UpdateContainerStatus", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if role == "admin" {
		err := db.InsertHistory("container", id, "update", r.Context().Value("user").(models.AuthClaims).Id, oldContainer, payload)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "UpdateContainerStatus", "id", id, "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// DeleteContainer godoc
// @Summary      Delete container
// @Description  Soft delete a container by its ID
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id   path      int  true  "Container ID"
// @Success      204  {object}  nil  "No Content"
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {string}  string  "Internal error"
// @Router       /containers/{id}/ [delete]
func DeleteContainer(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}
	id, _ := strconv.Atoi(r.PathValue("id"))

	exist, err := db.CheckContainerExistById(id)
	if err != nil {
		slog.Error("CheckContainerExistById() failed", "controller", "DeleteContainer", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Container not found")
		return
	}

	// can't delete if currently have active code
	codes, err := db.GetAllCodesByContainerId(id)
	if err != nil {
		slog.Error("GetAllCodesByContainerId() failed", "controller", "DeleteContainer", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	for _, code := range codes {
		if code.Status == "active" {
			utils.RespondWithError(w, http.StatusConflict, "Container is currently being used.")
			return
		}
	}

	if err := db.SoftDeleteContainer(id); err != nil {
		slog.Error("SoftDeleteContainer() failed", "controller", "DeleteContainer", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if role == "admin" {
		err := db.InsertHistory("container", id, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "DeleteContainer", "id", id, "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetContainerCountStats godoc
// @Summary      Get container count stats
// @Description  Get statistics about container counts (total and active)
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200  {object}  models.ContainerCountStats
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {string}  string  "Internal error"
// @Router       /containers/count/ [get]
func GetContainerCountStats(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	statusParam := "active"
	activeCount, err := db.GetContainerCountByStatus(&statusParam)
	if err != nil {
		slog.Error("GetContainerCountByStatus() failed", "controller", "GetContainerCount", "error", err, "status", statusParam)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	statusParam = "not_deleted"
	totalCount, err := db.GetContainerCountByStatus(&statusParam)
	if err != nil {
		slog.Error("GetContainerCountByStatus() failed", "controller", "GetContainerCount", "error", err, "status", statusParam)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	stats := models.ContainerCountStats{
		Total:  totalCount,
		Active: activeCount,
	}
	utils.RespondWithJSON(w, http.StatusOK, stats)
}

// CreateContainerHandler godoc
// @Summary      Create container
// @Description  Create a new container
// @Tags         container
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        container  body      models.Container  true  "Container details"
// @Success      201        {object}  models.Container
// @Failure      400        {string}  string  "Invalid request or postal code"
// @Failure      500        {string}  string  "Creation failed"
// @Router       /containers/ [post]
func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
	var c models.Container
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	_, err := strconv.Atoi(c.PostalCode)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid postal code")
		return
	}

	if c.Street == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Street is required")
		return
	}
	if c.CityName == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "City is required")
		return
	}
	if c.PostalCode == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Postal code is required")
		return
	}

	// resolve lat/lng
	var addressToResolve = models.Address{
		Street:     c.Street,
		City:       c.CityName,
		PostalCode: c.PostalCode,
	}

	coordinates, err := geocode.AddressToCoor(addressToResolve)
	if err != nil {
		if err.Error() == "ZERO_RESULTS" {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid address")
			return
		}
		slog.Error("AddressToCoor() failed", "controller", "CreateContainerHandler", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to resolve coordinates")
		return
	}
	c.Lat = coordinates.Lat
	c.Lng = coordinates.Lng

	id, err := db.InsertContainer(c)
	if err != nil {
		slog.Error("Failed to create container", "error", err)
		http.Error(w, "Creation failed", http.StatusInternalServerError)
		return
	}

	if r.Context().Value("user").(models.AuthClaims).Role == "admin" {
		err = db.InsertHistory("container", id, "create", r.Context().Value("user").(models.AuthClaims).Id, nil, c)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "CreateContainerHandler", "id", id, "error", err)
		}
	}

	c.ID = id
	utils.RespondWithJSON(w, http.StatusCreated, c)
}

// GetAvailableContainers godoc
// @Summary      Get available containers
// @Description  Get a list of available containers
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200  {array}   models.Container
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {string}  string  "Internal server error"
// @Router       /containers/available/ [get]
func GetAvailableContainers(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	containers, err := db.GetAvailableContainers()
	if err != nil {
		slog.Error("GetAvailableContainers() failed", "controller", "GetAvailableContainers", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching available containers.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, containers)
}

// UpdateContainerLocation godoc
// @Summary      Update container location
// @Description  Update the location of a container.
// @Tags         container
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Container ID"
// @Param        body  body      models.UpdateLocationRequest  true  "New location payload"
// @Success      204   {object}  nil     "No Content"
// @Failure      401   {object}  nil     "Unauthorized"
// @Failure      500   {string}  string  "Internal error"
// @Router       /containers/{id}/location/ [put]
func UpdateContainerLocation(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid container ID.")
		return
	}

	exist, err := db.CheckContainerExistById(id)
	if err != nil {
		slog.Error("CheckContainerExistById() failed", "controller", "UpdateContainerLocation", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while checking container existence.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Container with ID "+strconv.Itoa(id)+" not found.")
		return
	}

	var payload models.UpdateLocationRequest
	json.NewDecoder(r.Body).Decode(&payload)

	if payload.CityName == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid city name.")
		return
	}
	if payload.Street == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Street is required.")
		return
	}
	if payload.PostalCode == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Postal code is required.")
		return
	}
	

	oldContainer, _ := db.FindContainerByID(id)
	hasLocationChange := false
	if oldContainer.CityName != payload.CityName || oldContainer.Street != payload.Street || oldContainer.PostalCode != payload.PostalCode {
		hasLocationChange = true
	}
	if hasLocationChange {
		addressToResolve := models.Address{
			Street:     payload.Street,
			City:       payload.CityName,
			PostalCode: payload.PostalCode,
		}

		coordinates, err := geocode.AddressToCoor(addressToResolve)
		if err != nil {
			if err.Error() == "ZERO_RESULTS" {
				utils.RespondWithError(w, http.StatusBadRequest, "Invalid address")
				return
			}
			slog.Error("AddressToCoor() failed", "controller", "UpdateContainerLocation", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to resolve coordinates")
			return
		}
		payload.Lat = &coordinates.Lat
		payload.Lng = &coordinates.Lng
	}

	if err := db.UpdateLocationContainer(id, payload); err != nil {
		slog.Error("UpdateLocationContainer() failed", "controller", "UpdateContainerLocation", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	err = db.InsertHistory("container", id, "update", r.Context().Value("user").(models.AuthClaims).Id, oldContainer, payload)
	if err != nil {
		slog.Error("InsertHistory() failed", "controller", "UpdateContainerLocation", "id", id, "error", err)
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetContainerSchedule godoc
// @Summary      Get container schedule
// @Description  Returns the list of deposits and their planned dates (barcode valid date range) for a specific container.
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id   path      int  true  "Container ID"
// @Success      200  {array}   models.ContainerSchedule
// @Failure      400  {object}  nil  "Invalid ID"
// @Failure      404  {object}  nil  "Container not found"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /containers/{id}/schedule/ [get]
func GetContainerSchedule(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	exist, err := db.CheckContainerExistById(id)
	if err != nil {
		slog.Error("CheckContainerExistById() failed", "controller", "GetContainerSchedule", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Container not found")
		return
	}

	// get list of items and their dates planned for a container (bar code valid date range)
	deposits, err := db.GetContainerScheduleByContainerId(id)
	if err != nil {
		slog.Error("GetContainerScheduleByContainerId() failed", "controller", "GetContainerSchedule", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container schedule.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, deposits)
}

// GetContainerEarliestAvailability godoc
// @Summary      Get earliest availability for a container
// @Description  Calculates the earliest date and time the container will be available by looking at planned schedules (user and pro barcode ranges).
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id   path      int  true  "Container ID"
// @Success      200  {object}  map[string]time.Time "Earliest availability"
// @Failure      400  {object}  nil  "Invalid ID"
// @Failure      404  {object}  nil  "Container not found"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /containers/{id}/earliest/ [get]
func GetContainerEarliestAvailability(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	exist, err := db.CheckContainerExistById(id)
	if err != nil {
		slog.Error("CheckContainerExistById() failed", "controller", "GetContainerEarliestAvailability", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Container not found")
		return
	}

	// get list of items and their dates planned for a container (bar code valid date range)
	schedule, err := db.GetContainerScheduleByContainerId(id)
	if err != nil {
		slog.Error("GetContainerScheduleByContainerId() failed", "controller", "GetContainerEarliestAvailability", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching container schedule.")
		return
	}

	// Loop through UserRange and ProRange to find the latest occupied date 
	// and return the next earliest date (start date of next available slot after latest occupied date)
	earliest := time.Now()

	for _, item := range schedule.UserRange {
		if item.ValidTo.After(earliest) {
			earliest = item.ValidTo
		}
	}

	for _, item := range schedule.ProRange {
		if item.ValidTo.After(earliest) {
			earliest = item.ValidTo
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]time.Time{
		"earliest_availability": earliest,
	})
}

// GetNearestAvailableContainer godoc
// @Summary      Get nearest available container
// @Description  Get the available container closest to specified coordinates.
// @Tags         container
// @Security     ApiKeyAuth
// @Produce      json
// @Param        lat   query     float64  true  "Latitude"
// @Param        lng   query     float64  true  "Longitude"
// @Success      200   {object}  models.Container
// @Failure      400   {object}  nil  "Missing or invalid latitude/longitude"
// @Failure      401   {object}  nil  "Unauthorized"
// @Failure      404   {object}  nil  "No available containers found"
// @Failure      500   {object}  nil  "Internal server error"
// @Router       /containers/nearest/ [get]
func GetNearestAvailableContainer(w http.ResponseWriter, r *http.Request) {
	// get params: lat, lng from query
	query := r.URL.Query()
	latStr := query.Get("lat")
	lngStr := query.Get("lng")

	// validate
	if latStr == "" || lngStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing latitude or longitude")
		return
	}

	// convert to float
	var params models.Coordinates
	_, err := fmt.Sscanf(latStr, "%f", &params.Lat)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid latitude format")
		return
	}
	_, err = fmt.Sscanf(lngStr, "%f", &params.Lng)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude format")
		return
	}

	if params.Lat > 90 || params.Lat < -90 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid latitude")
		return
	}
	if params.Lng > 180 || params.Lng < -180 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude")
		return
	}
	
	// get all available containers and sort them by distance from the user's location (the closer the better)
	containers, err := db.GetAvailableContainers()
	if err != nil {
		slog.Error("GetAvailableContainers() failed", "controller", "GetNearestAvailableContainer", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching available containers.")
		return
	}

	containersCoords := make([]models.Coordinates, len(containers))
	for i, c := range containers {
		containersCoords[i] = models.Coordinates{
			Lat: c.Lat,
			Lng: c.Lng,
		}
	}
	closestIndex := geocode.GetClosestCoordinate(params, containersCoords)
	if closestIndex == -1 {
		utils.RespondWithError(w, http.StatusNotFound, "No available containers found.")
		return
	}
	closestContainer := containers[closestIndex]

	utils.RespondWithJSON(w, http.StatusOK, closestContainer)
}