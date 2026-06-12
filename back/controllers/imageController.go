package controllers

import (
	"backend/utils"
	helpers "backend/utils/helpers"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"
)

func ServeImageHandler(w http.ResponseWriter, r *http.Request) {
	imagePath := r.URL.Query().Get("path")
	slog.Debug("Debug Image", "imagePath", imagePath)
	if imagePath == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Image path is required.")
		return
	}

	// Clean the path and prevent directory traversal
	cleanPath := filepath.Clean(imagePath)
	if filepath.IsAbs(cleanPath) || !strings.HasPrefix(cleanPath, "images/") || strings.Contains(cleanPath, "..") {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid image path.")
		return
	}

	if !helpers.IsFileExists(cleanPath) {
		utils.RespondWithError(w, http.StatusNotFound, "Image not found.")
		return
	}

	// Cache control for mobile client image loader (Coil)
	w.Header().Set("Cache-Control", "public, max-age=604800")
	w.Header().Set("Content-Disposition", "inline")
	http.ServeFile(w, r, cleanPath)
}