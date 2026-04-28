package routes

import (
	_ "backend/docs"
	"net/http"

	httpSwagger "github.com/swaggo/http-swagger"
)

func GetAllRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	GetHealthCheckRoutes(mux)
	GetAuthRoutes(mux)
	GetAccountRoutes(mux)
	GetValidationRoutes(mux)
	GetContainerRoutes(mux)
	GetEventRoutes(mux)
	GetEmployeeRoutes(mux)
	GetUserRoutes(mux)
	GetPostRoutes(mux)
	GetCommentRoutes(mux)
	GetAdminHistoryRoutes(mux)
	GetItemRoutes(mux)
	GetListingRoutes(mux)
	GetDepositRoutes(mux)
	GetSubscriptionRoutes(mux)
	GetFinanceRoutes(mux)
	GetAdsRoutes(mux)
	GetStripeRoutes(mux)

	// swagger API documentation
	mux.Handle("/swagger/", httpSwagger.WrapHandler)

	// serve uploaded files
	mux.Handle("GET /images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	return mux
}
