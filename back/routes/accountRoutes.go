package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	mux.Handle("POST /register", middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccount)))
	mux.Handle("POST /accounts/onboarding", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateOnboarding))))
	mux.Handle("POST /accounts/{id_account}/avatar", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateAvatar))))

	mux.Handle("GET /accounts", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccountsAdmin))))
	mux.Handle("GET /accounts/count", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountCount))))
	mux.Handle("GET /accounts/export", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ExportAccountsCsv))))
	mux.Handle("GET /accounts/{id_account}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountDetails))))
	mux.Handle("GET /accounts/{id_account}/stats", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAccountStats))))
	mux.Handle("GET /accounts/{id_account}/notifications", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetNotiSettings))))

	mux.Handle("PATCH /accounts/{id_account}/password", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdatePassword))))
	mux.Handle("PATCH /accounts/{id_account}/ban", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ToggleBanAccount))))
	mux.Handle("PATCH /accounts/{id_account}/recover", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RecoverAccount))))
	mux.Handle("PATCH /accounts/{id_account}/update", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateAccount))))
	mux.Handle("PATCH /accounts/{id_account}/notifications", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateNotiSetting))))

	mux.Handle("DELETE /accounts/{id_account}", middleware.AuthMiddleware([]string{"admin", "employee", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SoftDeleteAccount))))
}
