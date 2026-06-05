package routes

import (
	"backend/controllers"
	"net/http"
)

func GetAIRoutes(mux *http.ServeMux) {
	mux.Handle("POST /chatbot", http.HandlerFunc(controllers.Chatbot))
}