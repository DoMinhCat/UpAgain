package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetImageRoutes(mux *http.ServeMux) {
	// to serve mobile app
	mux.Handle("GET /mobile/images", middleware.AuthMiddleware([]string{"pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ServeImageHandler))))

	// for serving web images directly from disk
	mux.Handle("GET /images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))
}
