package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetDepositRoutes(mux *http.ServeMux) {
	mux.Handle("GET /deposits/{deposit_id}/{$}", middleware.AuthMiddleware([]string{"admin", "pro", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetDepositDetailsById))))
}
