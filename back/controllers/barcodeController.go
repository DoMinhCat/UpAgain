package controllers

import (
	"net/http"
)

func DownloadBarcode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=example.pdf")
	w.Write([]byte("Hello, World!"))
}