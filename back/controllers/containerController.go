package controllers

import (
	"backend/db"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
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
