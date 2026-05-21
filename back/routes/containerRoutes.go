package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /containers/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainers))))
	mux.Handle("GET /containers/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainersCount))))
	mux.Handle("GET /containers/available/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableContainers))))
	mux.Handle("GET /containers/{id}/schedule/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerSchedule))))
	mux.Handle("GET /containers/{id}/earliest/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerEarliestSlot))))
	mux.Handle("GET /containers/nearest/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetNearestContainer))))
}
