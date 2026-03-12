package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /containers/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllContainersHandler))))
	mux.Handle("GET /containers/{id}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerByID))))

	mux.Handle("PUT /containers/{id}/status/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateContainerStatus))))
	mux.Handle("DELETE /containers/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteContainer))))
	mux.Handle("GET /containers/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetContainerCountStats))))
}
