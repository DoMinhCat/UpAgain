package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetUserRoutes(mux *http.ServeMux) {
	mux.Handle("GET /users/score/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetTotalScore))))
	mux.Handle("GET /users/impact/global/{$}", http.HandlerFunc(controllers.GetGlobalImpact))
	mux.Handle("GET /users/impact/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetUserImpact))))
	mux.Handle("GET /users/items/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetUserImpactItems))))
}
