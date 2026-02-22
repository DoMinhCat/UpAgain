package main

import (
	"backend/routes"
	"backend/utils"
	"log/slog"
	"net/http"

	"github.com/rs/cors"
)

func main(){
	utils.InitLogger()

	utils.LoadEnv()
	utils.Conn, utils.ErrDb = utils.GetDb()
	if utils.ErrDb != nil{
		slog.Error("failed to connect to database", "error", utils.ErrDb)
	}else{
		slog.Info("connected to database successfully")
	}
	defer utils.Conn.Close()


	mux := routes.GetAllRoutes()
	// CORS configuration
	allowedOrigins :=  []string{utils.GetFrontOriginDev(), utils.GetFrontOriginProd()}
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := corsHandler.Handler(mux)

	port := utils.GetPort()
	slog.Info("backend started", "port", port)
	err := http.ListenAndServe(":" + port, handler)
	if err != nil {
		slog.Error("server failed to start", "error", err)
	}
}
