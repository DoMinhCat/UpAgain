package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetCommentRoutes(mux *http.ServeMux) {
	mux.Handle("DELETE /comments/{id_comment}/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "employee", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteCommentById))))
}
