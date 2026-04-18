package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetSubscriptionRoutes(mux *http.ServeMux) {
	mux.Handle("GET /subscriptions/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllSubscriptionsHandler))))
	mux.Handle("GET /subscriptions/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSubscriptionByIDHandler))))
	mux.Handle("GET /subscriptions/price/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSubscriptionPriceHandler))))
	mux.Handle("GET /subscriptions/trial/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetTrialDaysHandler))))
	mux.Handle("GET /subscriptions/stats/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetSubscriptionStatsHandler))))

	mux.Handle("PUT /subscriptions/{id}/revoke/{$}", middleware.AuthMiddleware([]string{"admin", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelSubscriptionHandler))))
	mux.Handle("PUT /subscriptions/price/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateSubscriptionPriceHandler))))
	mux.Handle("PUT /subscriptions/trial/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateTrialDaysHandler))))
}
