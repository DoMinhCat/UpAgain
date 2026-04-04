package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetListingRoutes(mux *http.ServeMux) {
	mux.Handle("GET /listings/{listing_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user", "pro"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetListingDetails))))
	mux.Handle("PUT /listings/{listing_id}/{$}", middleware.AuthMiddleware([]string{"admin", "user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.UpdateListing))))
}