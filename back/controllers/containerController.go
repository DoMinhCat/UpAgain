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

func GetAllContainersHandler(w http.ResponseWriter, r *http.Request) {
	containers, err := db.GetAllContainers()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching containers.")
		slog.Error("GetAllContainers() failed", "controller", "GetAllContainersHandler", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, containers)
}

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

func UpdateContainerStatus(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))

	var body struct {
		Status string `json:"status"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if err := db.UpdateStatusContainer(id, body.Status); err != nil {
		slog.Error("UpdateStatusContainer() failed", "controller", "UpdateContainerStatus", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

func DeleteContainer(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))

	if err := db.SoftDeleteContainer(id); err != nil {
		slog.Error("SoftDeleteContainer() failed", "controller", "DeleteContainer", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// to show info in stats card on admin home
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
		Total: totalCount,
		Active: activeCount,
	}
	utils.RespondWithJSON(w, http.StatusOK, stats)
}


