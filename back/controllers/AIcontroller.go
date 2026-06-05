package controllers

import (
	"backend/config"
	"backend/utils"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"google.golang.org/genai"
)

type ChatbotRequest struct {
	Message string `json:"message"`
}

type ChatbotResponse struct {
	Response string `json:"response"`
}

// Chatbot godoc
// @Summary      Chat with Gemini AI
// @Description  Send a prompt/message to the Gemini AI API and get the response text.
// @Tags         ai
// @Accept       json
// @Produce      json
// @Param        body  body      controllers.ChatbotRequest  true  "Chatbot prompt message"
// @Success      200   {object}  controllers.ChatbotResponse
// @Failure      400   {object}  nil  "Invalid request body"
// @Failure      500   {object}  nil  "Internal server error"
// @Router       /chatbot [post]
func Chatbot(w http.ResponseWriter, r *http.Request) {
	var req ChatbotRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		slog.Error("Chatbot invalid JSON request body", "error", err)
		return
	}

	if req.Message == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Message cannot be empty.")
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.GeminiAPIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to init AI client.")
		slog.Error("genai.NewClient failed", "error", err)
		return
	}

	parts := []*genai.Part{
		{Text: req.Message},
	}
	contents := []*genai.Content{
		{Parts: parts},
	}

	result, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash", contents, nil)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to generate AI response.")
		slog.Error("client.Models.GenerateContent failed", "error", err)
		return
	}

	responseMsg := ""
	if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
		responseMsg = result.Candidates[0].Content.Parts[0].Text
	}

	utils.RespondWithJSON(w, http.StatusOK, ChatbotResponse{
		Response: responseMsg,
	})
}