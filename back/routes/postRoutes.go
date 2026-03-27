package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetPostRoutes(mux *http.ServeMux) {
	mux.Handle("GET /posts/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllPosts))))
	mux.Handle("GET /posts/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostsStats))))
	mux.Handle("POST /posts/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreatePost))))

}