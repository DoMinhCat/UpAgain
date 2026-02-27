package routes

import (
	"backend/controllers"
	"net/http"
)

func GetAuthRoutes(mux *http.ServeMux) {
	mux.Handle("POST /login/{$}", http.HandlerFunc(controllers.Login))
}
