package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {
	mux.Handle("POST /containers", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateContainerHandler))))
	mux.Handle("POST /containers/{id}/open", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.OpenContainer))))

	mux.Handle("GET /containers", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllContainersHandler))))
	mux.Handle("GET /containers/count", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerCountStats))))
	mux.Handle("GET /containers/nearest", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetNearestAvailableContainer))))
	mux.Handle("GET /containers/available", middleware.AuthMiddleware([]string{"admin", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableContainers))))
	mux.Handle("GET /containers/{id}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerByID))))
	mux.Handle("GET /containers/{id}/schedule", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerSchedule))))
	mux.Handle("GET /containers/{id}/earliest", middleware.AuthMiddleware([]string{"admin", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerEarliestAvailability))))

	mux.Handle("PUT /containers/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateContainerStatus))))
	mux.Handle("PUT /containers/{id}/location", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateContainerLocation))))

	mux.Handle("DELETE /containers/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteContainer))))
}
