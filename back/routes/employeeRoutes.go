package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEmployeeRoutes(mux *http.ServeMux) {
	mux.Handle("GET /employees/available/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableEmployees))))
	mux.Handle("GET /employees/{id_employee}/events/{$}", middleware.AuthMiddleware([]string{"admin", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEmployeeEvents))))
}
