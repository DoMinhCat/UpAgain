package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)


func GetBarcodeRoutes(mux *http.ServeMux) {
	mux.Handle("GET /codes/{deposit_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositCodesOfLatestTransactionByDepositId))))
}