package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEmployeeRoutes(mux *http.ServeMux) {
	mux.Handle("GET /employees/available/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableEmployees))))
}
