package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	// Create new account, this one handles the creation of an account for a user, pro or employee
	mux.Handle("POST /register/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.CreateAccount)))
	// Get all accounts, this one handles the retrieval of all accounts

	//TODO: add update lastactive middleware
	mux.Handle("GET /accounts/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAccounts)))
}
