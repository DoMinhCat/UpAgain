package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetValidationRoutes(mux *http.ServeMux) {
	// --- Stats overview ---
	mux.Handle("GET /admin/validations/stats", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetValidationStats))))

	// --- Paginated pending lists (new endpoints with search/sort/pagination) ---
	mux.Handle("GET /admin/validations/deposits", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPendingDepositsAdmin))))
	mux.Handle("GET /admin/validations/listings", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetPendingListingsAdmin))))

	// --- Process actions ---
	mux.Handle("PUT /admin/validations/listings/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ProcessListingValidation))))
	mux.Handle("PUT /admin/validations/deposits/{id}", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.ProcessDepositValidation))))

	// --- History ---
	mux.Handle("GET /admin/items/history", middleware.AuthMiddleware([]string{"admin"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetItemsHistory))))
}
