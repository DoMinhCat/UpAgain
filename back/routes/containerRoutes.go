package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {

	mux.Handle("GET /containers/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllContainersHandler))))
	mux.Handle("GET /containers/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerCountStats))))
	mux.Handle("GET /containers/{id}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerByID))))
	mux.Handle("GET /containers/available/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableContainers))))
	
	mux.Handle("POST /containers/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateContainerHandler))))
	mux.Handle("PUT /containers/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateContainerStatus))))
	mux.Handle("DELETE /containers/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteContainer))))
}
