package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	mux.Handle("POST /register/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccount)))
	mux.Handle("GET /accounts/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccountsAdmin))))
	mux.Handle("GET /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountDetails))))
	mux.Handle("DELETE /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SoftDeleteAccount))))
}

	
