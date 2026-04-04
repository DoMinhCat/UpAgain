package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetItemRoutes(mux *http.ServeMux) {
	mux.Handle("GET /items/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllItems))))
	mux.Handle("GET /items/{item_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro", "employee"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemDetails))))
	mux.Handle("GET /items/count/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllItemsStats))))
	mux.Handle("DELETE /items/{item_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.DeleteItemById))))
	mux.Handle("PATCH /items/{item_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateItemStatusById))))
	mux.Handle("GET /items/{item_id}/transactions/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemTransactions))))
}