package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetEventRoutes(mux *http.ServeMux) {
	mux.Handle("GET /events/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllEvents))))
	mux.Handle("GET /events/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEventStats))))
	mux.Handle("GET /events/employees/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAssignedEmployeesByEventId))))
	mux.Handle("GET /events/{id}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetEventDetailsById))))
	mux.Handle("GET /events/me/{$}", middleware.AuthMiddleware([]string{"user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetMyEventsByAccountId))))

	mux.Handle("POST /events/{id}/assign/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.AssignEmployeeToEventByEventId))))
	mux.Handle("POST /events/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateEvent))))
	mux.Handle("POST /events/register/{$}", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RegisterToEventByEventId))))

	mux.Handle("PUT /events/{id}/update/{$}", middleware.AuthMiddleware([]string{"admin", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateEventByEventId))))
	mux.Handle("PATCH /events/{id}/status/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelEventByEventId))))
	mux.Handle("PATCH /events/cancel/{$}", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelRegistrationByEventId))))

	mux.Handle("DELETE /events/{id}/unassign/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UnAssignEmployeeByEventId))))
}
