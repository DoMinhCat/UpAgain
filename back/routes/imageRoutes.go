package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetImageRoutes(mux *http.ServeMux) {
	mux.Handle("GET /images", middleware.AuthMiddleware([]string{"pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ServeImageHandler))))
}