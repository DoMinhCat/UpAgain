package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetStripeRoutes(mux *http.ServeMux) {
	mux.Handle("POST /payments/verify/{$}", middleware.AuthMiddleware([]string{"user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.VerifyPayment))))
}
