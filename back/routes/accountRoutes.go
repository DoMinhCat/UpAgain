package routes

import (
	"backend/controllers"
	"net/http"
)

func GetAccountRoutes(mux *http.ServeMux) {
	// Create new account, this one handles the creation of an account for a user, pro or employee
	mux.HandleFunc("POST /register/{$}", controllers.CreateAccount)
}
