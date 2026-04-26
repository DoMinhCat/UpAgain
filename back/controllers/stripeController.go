package controllers

import (
	"backend/models"
	"backend/utils"
	stripe "backend/utils/stripe"
	"encoding/json"
	"net/http"
)

func VerifyPayment(w http.ResponseWriter, r *http.Request) {
	payload := models.VerifyPaymentRequest{}

	err := json.NewDecoder(r.Body).Decode(&payload)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if payload.SessionID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid session ID")
		return
	}

	isPaid, err := stripe.IsPaymentPaid(payload.SessionID)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid session")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, models.VerifyPaymentResponse{IsPaid: isPaid})
}