package routes

import (
	"net/http"
)

func GetAllRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	GetHealthCheckRoutes(mux)
	GetAuthRoutes(mux)
	GetAccountRoutes(mux)
	GetValidationRoutes(mux)
	GetContainerRoutes(mux)
	GetEventRoutes(mux)

	return mux
}
