package routes

import (
	"backend/controllers"
	"net/http"
)

func GetContainerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /containers/{$}", http.HandlerFunc(controllers.GetAllContainersHandler))
	mux.Handle("GET /containers/{id}/{$}", http.HandlerFunc(controllers.GetContainerByID))

	mux.Handle("PUT /containers/{id}/status/{$}", http.HandlerFunc(controllers.UpdateContainerStatus))
	mux.Handle("DELETE /containers/{id}/{$}", http.HandlerFunc(controllers.DeleteContainer))
}
