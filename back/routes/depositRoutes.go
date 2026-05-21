package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetDepositRoutes(mux *http.ServeMux) {
	mux.Handle("GET /deposits/{deposit_id}/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositDetailsById))))
	mux.Handle("GET /deposits/{deposit_id}/codes/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositCodesOfLatestTransactionByDepositId))))
	mux.Handle("POST /deposits/{deposit_id}/transfer/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.TransferContainerByDepositId))))
}
