package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEventRoutes(mux *http.ServeMux) {
	mux.Handle("GET /events/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllEvents))))
	mux.Handle("GET /events/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEventStats))))
	mux.Handle("POST /events/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateEvent))))
}
