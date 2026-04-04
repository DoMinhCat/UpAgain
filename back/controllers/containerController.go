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
// @Success      200  {array}   models.Container
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /containers/ [get]
func GetAllContainersHandler(w http.ResponseWriter, r *http.Request) {
	containers, err := db.GetAllContainers()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching containers.")
		slog.Error("GetAllContainers() failed", "controller", "GetAllContainersHandler", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, containers)
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

	container, err := db.FindContainerByID(id)
	if err != nil {
		slog.Error("FindContainerByID() failed", "controller", "GetContainerByID", "id", id, "error", err)
		http.Error(w, "Container not found", http.StatusNotFound)
		return
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
