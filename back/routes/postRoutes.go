package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetPostRoutes(mux *http.ServeMux) {
	mux.Handle("POST /posts", middleware.AuthMiddleware([]string{"admin", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreatePost))))
	mux.Handle("POST /posts/{id_post}/view", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ViewPost))))
	mux.Handle("POST /posts/{id_post}/like", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.LikePost))))
	mux.Handle("POST /posts/{id_post}/save", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SavePost))))
	mux.Handle("POST /posts/{id_post}/steps", middleware.AuthMiddleware([]string{"pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreatePostStep))))

	mux.Handle("GET /posts", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllPosts))))
	mux.Handle("GET /posts/count", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostsStats))))
	mux.Handle("GET /posts/me", middleware.AuthMiddleware([]string{"pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostsByAccountId))))
	mux.Handle("GET /posts/saved", middleware.AuthMiddleware([]string{"pro", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSavedPosts))))
	mux.Handle("GET /posts/{id_post}", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostDetailsById))))
	mux.Handle("GET /posts/{id_post}/comments", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPostCommentsByPostId))))
	mux.Handle("GET /posts/{id_post}/steps", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetProjectStepsByPostId))))

	mux.Handle("PUT /posts/{id_post}", middleware.AuthMiddleware([]string{"admin", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdatePostById))))

	mux.Handle("DELETE /posts/{id_post}", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeletePost))))
	mux.Handle("DELETE /posts/steps/{step_id}", middleware.AuthMiddleware([]string{"admin", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteProjectStep))))

}
