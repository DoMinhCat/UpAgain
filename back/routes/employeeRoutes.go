package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEmployeeRoutes(mux *http.ServeMux) {
	mux.Handle("GET /employees/available/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAvailableEmployees))))
	mux.Handle("GET /employees/{id_employee}/schedule/{$}", middleware.AuthMiddleware([]string{"admin", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEmployeeSchedule))))
}
