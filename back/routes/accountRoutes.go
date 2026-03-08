package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	mux.Handle("POST /register/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccount)))
	// only admin can get list of all users
	mux.Handle("GET /accounts/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccountsAdmin))))
	mux.Handle("GET /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountDetails))))
	// all logged in users can delete account, but only admin can delete other people's account => check this is controller
	mux.Handle("DELETE /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SoftDeleteAccount))))
	mux.Handle("PATCH /accounts/{id_account}/password/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdatePassword))))
	mux.Handle("PATCH /accounts/{id_account}/ban/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ToggleBanAccount))))
	mux.Handle("PATCH /accounts/{id_account}/recover/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RecoverAccount))))
	mux.Handle("GET /accounts/{id_account}/stats/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountStats))))
}
