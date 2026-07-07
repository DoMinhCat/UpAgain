package routes

import (
	"backend/controllers"
	"net/http"
)

func GetAuthRoutes(mux *http.ServeMux) {
	mux.Handle("POST /login", http.HandlerFunc(controllers.Login))
	mux.Handle("POST /refresh", http.HandlerFunc(controllers.RefreshToken))
	mux.Handle("GET /verify-email/{token}/", http.HandlerFunc(controllers.VerifyEmail))
}
