package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	// only admin can get list of all users
	mux.Handle("GET /accounts/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccountsAdmin))))
	mux.Handle("GET /accounts/export/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ExportAccountsCsv))))
	mux.Handle("GET /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountDetails))))

	mux.Handle("GET /accounts/{id_account}/stats/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountStats))))
	mux.Handle("GET /accounts/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountCount))))

	mux.Handle("POST /register/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccount)))

	mux.Handle("PATCH /accounts/{id_account}/password/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdatePassword))))
	mux.Handle("PATCH /accounts/{id_account}/ban/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ToggleBanAccount))))
	mux.Handle("PATCH /accounts/{id_account}/recover/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RecoverAccount))))
	mux.Handle("PATCH /accounts/{id_account}/update/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateAccount))))

	// all logged in users can delete account, but only admin can delete other people's account => check this is controller
	mux.Handle("DELETE /accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SoftDeleteAccount))))
}
