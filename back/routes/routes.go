package routes

import (
	"net/http"
)

func GetAllRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	GetHealthCheckRoutes(mux)
	GetAuthRoutes(mux)
	GetAccountRoutes(mux)

	// add more routes later
	// GetEventRoutes(mux)
	// GetContainerRoutes(mux)

	return mux
}