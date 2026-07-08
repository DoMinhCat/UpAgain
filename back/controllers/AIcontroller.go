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

	systemPrompt := `You are "Arnaud", a friendly and helpful AI upcycling assistant for the UpAgain platform. 
UpAgain is an eco-friendly platform where users can trade, recycle, and upcycle materials (like wood, metal, plastic, textile, glass, mixed, etc.) by posting listings or depositing items into smart containers.

CRITICAL RULES FOR TOPIC LIMITATION:
1. You must ONLY answer questions directly related to upcycling, recycling, DIY tutorials for materials, eco-friendly or circular economy practices, and the UpAgain platform features (marketplace, container deposits, user onboarding, events).
2. If the user asks about ANY unrelated topic (including but not limited to general knowledge, coding, writing code, mathematics, translation of random texts, cooking recipes, general news, history, music, pop culture, or general chit-chat unrelated to ecology/upcycling), you MUST politely refuse to answer. 
3. When refusing, explain that your capabilities are strictly limited to upcycling, eco-friendliness, and the UpAgain platform, and encourage the user to ask an on-topic question. Be polite, clear, and firm.`

	config := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{
				{Text: systemPrompt},
			},
		},
	}

	result, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash", contents, config)
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
