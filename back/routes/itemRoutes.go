package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetItemRoutes(mux *http.ServeMux) {
	mux.Handle("GET /items", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllItems))))
	mux.Handle("GET /items/count", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllItemsStats))))
	mux.Handle("GET /items/{item_id}", middleware.AuthMiddleware([]string{"admin","user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemDetails))))
	mux.Handle("DELETE /items/{item_id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteItemById))))
	mux.Handle("POST /items/{item_id}/reserve", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ReserveItem))))
	mux.Handle("POST /items/{item_id}/cancel", middleware.AuthMiddleware([]string{"user","admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.CancelItemReservation))))
	mux.Handle("POST /items/{item_id}/purchase", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.PurchaseItem))))
	mux.Handle("GET /items/{item_id}/transactions/latest", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetLatestTransaction))))
	mux.Handle("GET /items/{item_id}/transactions", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemTransactions))))
}
