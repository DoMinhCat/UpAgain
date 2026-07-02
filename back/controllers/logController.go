package controllers

import (
	"net/http"
	"os"
)

func ServeLogs(w http.ResponseWriter, r *http.Request) {
	logPath := "backend.log"

	// Check if the file exists yet, create it if not
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		file, err := os.Create(logPath)
		if err != nil {
			http.Error(w, "Unable to create log file: "+err.Error(), http.StatusInternalServerError)
			return
		}
		file.WriteString("Log file initialized.\n")
		file.Close()
	}

	// Force browser to display it as plain text instead of downloading it as a file
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Content-Disposition", "inline; filename=backend.log")

	// Stream the file chunks safely out of the VM disk
	http.ServeFile(w, r, logPath)
}