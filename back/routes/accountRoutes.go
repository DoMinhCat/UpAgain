package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	// 1. ADMIN ROUTES
	// Admin create new account, this one handles the creation of an account for a user, pro or employee
	mux.Handle("POST /admin/register/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccountAdmin))))
	// Get all accounts, this one handles the retrieval of all accounts
	mux.Handle("GET /admin/accounts/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccountsAdmin))))
	// Soft delete an account, this one handles the soft deletion of an account
	mux.Handle("DELETE /admin/accounts/{id_account}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.SoftDeleteAccountAdmin))))
	
	// 2. GUEST ROUTES
	// Guest create new account
	mux.Handle("POST /register/{$}", http.HandlerFunc(controllers.CreateAccountGuest))
}

	
