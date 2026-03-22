package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEventRoutes(mux *http.ServeMux) {
	mux.Handle("GET /events/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllEvents))))
	mux.Handle("GET /events/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEventStats))))
	mux.Handle("POST /events/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateEvent))))
	mux.Handle("GET /events/{id_event}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEventDetailsById))))
	mux.Handle("GET /events/employees/{id_event}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAssignedEmployeesByEventId))))
	mux.Handle("POST /events/{id_event}/assign/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.AssignEmployeeToEventByEventId))))
	mux.Handle("DELETE /events/{id_event}/unassign/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UnAssignEmployeeByEventId))))
	mux.Handle("PATCH /events/{id_event}/cancel/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelEventByEventId))))
}
