package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetFinanceRoutes(mux *http.ServeMux) {
	mux.Handle("GET /finance/revenue/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetFinanceRevenue))))
	mux.Handle("GET /finance/settings/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetFinanceSettings))))
	mux.Handle("GET /finance/settings/{key}/{$}", middleware.UpdateLastActive(http.HandlerFunc(controllers.GetFinanceSettingsByKey)))
	mux.Handle("GET /finance/invoices/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetInvoiceUsers))))
	mux.Handle("GET /finance/invoices/{userId}/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetUserInvoices))))

	mux.Handle("PUT /finance/settings/{key}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateFinanceSetting))))
}
