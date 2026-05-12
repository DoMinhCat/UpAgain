package routes

import (
	"backend/controllers"
	"backend/middleware"
	"net/http"
)

func GetListingRoutes(mux *http.ServeMux) {
	// get addresse based on lat/lng
	mux.Handle("GET /location/address/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetAddressFromCoor))))

	// get lat/lng based on address
	mux.Handle("GET /location/coordinates/{$}", middleware.AuthMiddleware([]string{"user"}, middleware.UpdateLastActive(http.HandlerFunc(controllers.GetCoorFromAddress))))
}