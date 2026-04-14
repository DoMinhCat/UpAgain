package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetSubscriptionRoutes(mux *http.ServeMux) {
	mux.Handle("GET /subscriptions/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllSubscriptionsHandler))))
	mux.Handle("GET /subscriptions/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSubscriptionByIDHandler))))
	mux.Handle("PUT /subscriptions/{id}/revoke/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.RevokeSubscriptionHandler))))
	mux.Handle("PUT /subscriptions/price/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateSubscriptionPriceHandler))))
	mux.Handle("GET /subscriptions/price/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSubscriptionPriceHandler))))
}
