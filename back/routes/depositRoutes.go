package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetDepositRoutes(mux *http.ServeMux) {
	mux.Handle("GET /deposits/{id}/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositById))))
	mux.Handle("GET /deposits/{id}/codes/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositCodes))))
	mux.Handle("POST /deposits/{id}/transfer/{$}", middleware.AuthMiddleware([]string{"user", "pro", "admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.TransferDeposit))))
}
