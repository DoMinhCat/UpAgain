package controllers

import (
	"backend/utils"
	helpers "backend/utils/helpers"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"
)

// ServeImageHandler godoc
// @Summary      Serve upload image
// @Description  Serve an uploaded image by its relative path. Requires 'pro' user privileges.
// @Tags         images
// @Security     ApiKeyAuth
// @Produce      png
// @Produce      jpeg
// @Produce      gif
// @Param        path  query     string  true  "Relative path to the image, e.g. images/accounts/avatar.png"
// @Success      200   {file}    binary  "The image file"
// @Failure      400   {object}  nil     "Invalid query parameter or path directory traversal attempt"
// @Failure      401   {object}  nil     "Unauthorized - login required"
// @Failure      403   {object}  nil     "Forbidden - requires 'pro' role"
// @Failure      404   {object}  nil     "Image not found"
// @Router       /images [get]
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