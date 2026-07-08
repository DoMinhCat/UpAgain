package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetLogRoutes(mux *http.ServeMux) {
	mux.Handle("GET /logs", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ServeLogs))))
}
