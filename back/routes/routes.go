package routes

import (
	_ "backend/docs"
	"net/http"

	httpSwagger "github.com/swaggo/http-swagger"
)

func GetAllRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	GetHealthCheckRoutes(mux)
	GetAuthRoutes(mux)
	GetAccountRoutes(mux)
	GetValidationRoutes(mux)
	GetContainerRoutes(mux)
	GetEventRoutes(mux)

		// swagger API documentation
	mux.Handle("/swagger/", httpSwagger.WrapHandler)

	return mux
}
