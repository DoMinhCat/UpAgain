package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetNotificationRoutes(mux *http.ServeMux) {
	allRoles := []string{"admin", "employee", "pro", "user"}

	mux.Handle("GET /notifications", middleware.AuthMiddleware(allRoles, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetNotificationsOfAccount))))
	mux.Handle("PATCH /notifications/read", middleware.AuthMiddleware(allRoles, middleware.UpdateLastActive(http.HandlerFunc(controllers.MarkNotificationAsRead))))
	mux.Handle("DELETE /notifications/{noti_id}", middleware.AuthMiddleware(allRoles, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteNotification))))
}
