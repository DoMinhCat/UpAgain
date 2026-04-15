package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetFinanceRoutes(mux *http.ServeMux) {
	mux.Handle("GET /admin/finance/revenue/", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetFinanceRevenue))))
	mux.Handle("GET /admin/finance/settings/", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetFinanceSettings))))
	mux.Handle("PUT /admin/finance/settings/{key}/", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateFinanceSetting))))
	mux.Handle("GET /admin/finance/invoices/", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetInvoiceUsers))))
	mux.Handle("GET /admin/finance/invoices/{userId}/", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetUserInvoices))))
}
