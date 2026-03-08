package routes

import (
	"backend/controllers"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /containers/{$}", http.HandlerFunc(controllers.GetAllContainersHandler))
}
