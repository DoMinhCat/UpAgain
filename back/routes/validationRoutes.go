package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetValidationRoutes(mux *http.ServeMux) {
	mux.Handle("GET /admin/validations/pending/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPendingValidations))))
	mux.Handle("PUT /admin/validations/listings/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ProcessListingValidation))))
	mux.Handle("PUT /admin/validations/deposits/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ProcessDepositValidation))))
	mux.Handle("PUT /admin/validations/events/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ProcessEventValidation))))
}
