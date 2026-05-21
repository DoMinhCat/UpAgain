package main

import (
	"backend/config"
	"backend/routes"
	"backend/utils"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/rs/cors"
)

// @title           UpAgain backend Golang API
// @version         1.0
// @description     Backend API written in Golang that handles requests from the frontend.
// @host      localhost:8080
// @BasePath  /

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

func main() {
	utils.InitLogger()
	slog.Info("backend process starting...")

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "dev"
	}

	utils.LoadEnv(env)

	config.GeoCodeAPIKey = utils.GetGeoCodeApiKey()
	config.OnesignalAPIKEY = utils.GetOnesignalRestApiKey()
	utils.Conn, utils.ErrDb = utils.GetDb()
	if utils.ErrDb != nil {
		slog.Error("failed to connect to database", "error", utils.ErrDb)
	} else {
		slog.Info("connected to database successfully")
		defer utils.Conn.Close()
	}

	mux := routes.GetAllRoutes()
	// CORS configuration
	allowedOrigins := []string{utils.GetFrontOrigin(), "http://localhost:5174"}
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		ExposedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := corsHandler.Handler(CleanPathMiddleware(mux))

	port := utils.GetPort()
	slog.Info("backend started", "port", port)
	slog.Info("swagger docs at /swagger/")
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		slog.Error("server failed to start", "error", err)
	}
}
