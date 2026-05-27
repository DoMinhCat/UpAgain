package main

import (
	"backend/config"
	"backend/middleware"
	"backend/routes"
	"backend/utils"
	"log/slog"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

// @title           UpAgain backend Golang API
// @version         1.0
// @description     Backend API written in Golang that handles requests from the frontend.
// @host      localhost:8080
// @BasePath  /
func main() {
	utils.InitLogger()
	slog.Info("backend process starting...")

	// TODO: needs Arnaud to check with server config. Is it ok to load ".env" first here to get APP_ENV?
	// Which file do we get from, .env? Do we already have one on the server?
	err := godotenv.Load()
	if err != nil {
		slog.Error("Error loading '.env' file", "error", err)
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		// Default fallback
		slog.Info("APP_ENV not set, defaulting to 'dev'")
		env = "dev"
	}

	utils.LoadEnv(env)

	config.GeoCodeAPIKey = utils.GetGeoCodeApiKey()
	config.OnesignalAPIKEY = utils.GetOnesignalRestApiKey()
	config.OnesignalAppId = utils.GetOnesignalAppId()
	utils.Conn, utils.ErrDb = utils.GetDb()
	if utils.ErrDb != nil {
		slog.Error("failed to connect to database", "error", utils.ErrDb)
	} else {
		slog.Info("connected to database successfully")
		defer utils.Conn.Close()
	}

	mux := routes.GetAllRoutes()
	// CORS configuration
	allowedOrigins := []string{utils.GetFrontOrigin(), "http://localhost:5173", "http://localhost:5174", "http://upcycleconnect.org", "https://upcycleconnect.org"}
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		ExposedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := corsHandler.Handler(middleware.CleanPathMiddleware(mux))

	port := utils.GetPort()
	slog.Info("backend started", "port", port)
	slog.Info("swagger docs at /swagger/")
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		slog.Error("server failed to start", "error", err)
	}
}
