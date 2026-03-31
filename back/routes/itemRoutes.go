package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetItemRoutes(mux *http.ServeMux) {
	mux.Handle("GET /items/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllItems))))
}