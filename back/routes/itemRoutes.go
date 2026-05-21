package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetItemRoutes(mux *http.ServeMux) {
	mux.Handle("GET /items/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItems))))
	mux.Handle("GET /items/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemsCount))))
	mux.Handle("GET /items/{id}/{$}", middleware.AuthMiddleware([]string{"admin", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemById))))
	mux.Handle("DELETE /items/{id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteItem))))
	mux.Handle("POST /items/{id}/reserve/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ReserveItem))))
	mux.Handle("POST /items/{id}/cancel/{$}", middleware.AuthMiddleware([]string{"user", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelReservation))))
	mux.Handle("POST /items/{id}/purchase/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.PurchaseItem))))
	mux.Handle("GET /items/{id}/transactions/latest/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetLatestTransaction))))
	mux.Handle("GET /items/{id}/transactions/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemTransactions))))
	mux.Handle("POST /items/{id}/transactions/{uuid}/cancel/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelTransaction))))
}
