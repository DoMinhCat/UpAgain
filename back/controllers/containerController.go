package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
)

// GetAllContainersHandler godoc
// @Summary      Get all containers
// @Description  Get a list of all containers
// @Tags         container
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
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

// GetAvailableContainers godoc
// @Summary      Get available containers
// @Description  Get a list of available containers
// @Tags         container
// @Produce      json
// @Success      200  {array}   models.Container
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {string}  string  "Internal server error"
// @Router       /containers/available/ [get]
func GetAvailableContainers(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
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

	oldContainer, _ := db.FindContainerByID(id)

	if err := db.UpdateLocationContainer(id, payload.CityName); err != nil {
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

// Get the item their dates planned for a container
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