package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAdsRoutes(mux *http.ServeMux) {
	// only admin can get list of all users
	mux.Handle("POST /ads/{$}", middleware.AuthMiddleware([]string{"admin", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAdsForProject))))
}