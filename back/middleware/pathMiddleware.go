package middleware

import (
	"log/slog"
	"net/http"
	"strings"
)

func CleanPathMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		oldPath := r.URL.Path
		path := oldPath

		// 1. Strip /api prefix correctly
		if strings.HasPrefix(path, "/api/") {
			path = strings.TrimPrefix(path, "/api")
		} else if path == "/api" {
			path = "/"
		}

		// 2. Strip trailing slash except for root
		if path != "/" && strings.HasSuffix(path, "/") &&
			!strings.Contains(path, "/swagger/") &&
			!strings.Contains(path, "/images/") {
			path = strings.TrimSuffix(path, "/")
		}

		r.URL.Path = path

		slog.Info("Path Cleaning", "method", r.Method, "from", oldPath, "to", path)

		next.ServeHTTP(w, r)
	})
}
