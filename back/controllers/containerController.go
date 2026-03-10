package controllers

import (
	"backend/db"
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(containers)
}

func GetContainerByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	container, err := db.FindContainerByID(id)
	if err != nil {
		slog.Error("Failed to fetch container", "id", id, "error", err)
		http.Error(w, "Container not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(container)
}

func UpdateContainerStatus(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))

	var body struct {
		Status string `json:"status"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if err := db.UpdateStatus(id, body.Status); err != nil {
		slog.Error("Update failed", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func DeleteContainer(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))

	if err := db.SoftDelete(id); err != nil {
		slog.Error("Deletion failed", "id", id, "error", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
