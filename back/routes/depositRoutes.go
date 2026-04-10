package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetDepositRoutes(mux *http.ServeMux) {
	mux.Handle("GET /deposits/{deposit_id}/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositDetailsById))))
	mux.Handle("GET /deposits/{deposit_id}/codes/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositCodesOfLatestTransactionByDepositId))))

	mux.Handle("PUT /deposits/{deposit_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateDepositByDepositId))))
	mux.Handle("PATCH /deposits/{deposit_id}/transfer/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.TransferContainerByDepositId))))
}
