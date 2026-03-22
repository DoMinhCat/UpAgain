package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetUserRoutes(mux *http.ServeMux) {
	mux.Handle("GET /users/score/{$}", middleware.AuthMiddleware([]string{"admin", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetTotalScore))))
}
