package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetPostRoutes(mux *http.ServeMux) {
	mux.Handle("GET /posts/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostsStats))))
}