package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetCommentRoutes(mux *http.ServeMux) {
	mux.Handle("POST /posts/{id_post}/comments", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateComment))))
	mux.Handle("POST /comments/{id_comment}/like", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.LikeComment))))

	mux.Handle("DELETE /comments/{id_comment}", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteCommentById))))

}
