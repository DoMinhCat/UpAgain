package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetAdminHistoryRoutes(mux *http.ServeMux) {
	mux.Handle("GET /history/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAdminHistory))))
	//mux.Handle("GET /history/{history_id}/{$}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAllAdminHistory))))
}
