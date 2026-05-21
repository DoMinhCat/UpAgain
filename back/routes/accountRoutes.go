package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	mux.Handle("GET /accounts/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccounts))))
	mux.Handle("GET /accounts/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountsCount))))
	mux.Handle("GET /accounts/export/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ExportAccounts))))
	mux.Handle("GET /accounts/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountById))))
	mux.Handle("PATCH /accounts/{id}/password/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdatePassword))))
	mux.Handle("PATCH /accounts/{id}/ban/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.BanAccount))))
	mux.Handle("PATCH /accounts/{id}/recover/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RecoverAccount))))
	mux.Handle("PATCH /accounts/{id}/update/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateAccount))))
	mux.Handle("GET /accounts/{id}/stats/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountStats))))
	mux.Handle("POST /accounts/{id}/avatar/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateAvatar))))
	mux.Handle("GET /accounts/{id}/notifications/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetNotifications))))
}
