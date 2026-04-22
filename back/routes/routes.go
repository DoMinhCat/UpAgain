package routes

import (
	_ "backend/docs"
	"net/http"

	httpSwagger "github.com/swaggo/http-swagger"
)

func GetAllRoutes() *http.ServeMux {
	// 1. On crée un mux interne pour toutes tes routes actuelles
	apiMux := http.NewServeMux()

	GetHealthCheckRoutes(apiMux)
	GetAuthRoutes(apiMux)
	GetAccountRoutes(apiMux)
	GetValidationRoutes(apiMux)
	GetContainerRoutes(apiMux)
	GetEventRoutes(apiMux)
	GetEmployeeRoutes(apiMux)
	GetUserRoutes(apiMux)
	GetPostRoutes(apiMux)
	GetCommentRoutes(apiMux)
	GetAdminHistoryRoutes(apiMux)
	GetItemRoutes(apiMux)
	GetListingRoutes(apiMux)
	GetDepositRoutes(apiMux)
	GetSubscriptionRoutes(apiMux)

	apiMux.Handle("/swagger/", httpSwagger.WrapHandler)
	apiMux.Handle("GET /images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	mainMux := http.NewServeMux()

	mainMux.Handle("/api/", http.StripPrefix("/api", apiMux))

	return mainMux
}
