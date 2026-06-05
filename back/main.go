package main

import (
	"backend/config"
	"backend/cron"
	"backend/middleware"
	"backend/routes"
	"backend/seed"
	"backend/utils"
	"flag"
	"fmt"
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

	// Load env variables
	err := godotenv.Load()
	if err != nil {
		slog.Warn("Error loading '.env' file", "error", err)
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		slog.Info("APP_ENV not set, defaulting to 'dev'")
		env = "dev"
	}
	utils.LoadEnv(env)


	// Run seeding script with `go run main.go --seed`
	// ! FOR DEV ONLY
	seedFlag := flag.Bool("seed", false, "run database seeder")
	flag.Parse()

	if *seedFlag {
		fmt.Println("Starting database seed...")
		seed.SeedDB()
		return   
	}


	// spin up server
	slog.Info("backend process starting...")
	config.GeoCodeAPIKey = utils.GetGeoCodeApiKey()
	config.OnesignalAPIKEY = utils.GetOnesignalRestApiKey()
	config.OnesignalAppId = utils.GetOnesignalAppId()
	config.GeminiAPIKey = utils.GetGeminiApiKey()
	utils.Conn, utils.ErrDb = utils.GetDb()
	if utils.ErrDb != nil {
		slog.Error("failed to connect to database", "error", utils.ErrDb)
	} else {
		slog.Info("connected to database successfully")
		defer utils.Conn.Close()
	}

	// Start cron jobs
	cron.StartCronJobs()

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
