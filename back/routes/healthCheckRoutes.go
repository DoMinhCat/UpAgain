package routes

import (
	"backend/controllers"
	"net/http"
)

func GetHealthCheckRoutes(mux *http.ServeMux) {
	mux.Handle("GET /healthcheck/{$}", http.HandlerFunc(controllers.HealthCheck))
}
