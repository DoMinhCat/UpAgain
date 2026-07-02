package controllers

import (
	"net/http"
	"os"
)

func ServeLogs(w http.ResponseWriter, r *http.Request) {
	logPath := "backend.log"

	// Check if the file exists yet
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		http.Error(w, "No logs generated yet.", http.StatusNotFound)
		return
	}

	// Force browser to display it as plain text instead of downloading it as a file
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Content-Disposition", "inline; filename=backend.log")

	// Stream the file chunks safely out of the VM disk
	http.ServeFile(w, r, logPath)
}