package main

import (
	"backend/routes"
	"backend/utils"
	"log/slog"
	"net/http"

	"github.com/rs/cors"
)

// @title           UpAgain backend Golang API
// @version         1.0
// @description     Backend API written in Golang that handles requests from the frontend.
// @host      localhost:8080
// @BasePath  /
func main() {
	utils.InitLogger()

	utils.LoadEnv()
	utils.Conn, utils.ErrDb = utils.GetDb()
	if utils.ErrDb != nil {
		slog.Error("failed to connect to database", "error", utils.ErrDb)
	} else {
		slog.Info("connected to database successfully")
	}
	defer utils.Conn.Close()

	mux := routes.GetAllRoutes()
	// CORS configuration
	allowedOrigins := []string{utils.GetFrontOriginDev(), utils.GetFrontOriginProd(), "http://localhost:5174"}
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		ExposedHeaders:   []string{"Content-Type", "Authorization", "Accept-Encoding"},
		AllowCredentials: true,
	})

	handler := corsHandler.Handler(mux)

	port := utils.GetPort()
	slog.Info("backend started", "port", port)
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		slog.Error("server failed to start", "error", err)
	}
}
