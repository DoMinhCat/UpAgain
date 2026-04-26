package controllers

import (
	"backend/utils"
	stripe "backend/utils/stripe"
	"net/http"
)

func VerifyPayment(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")

	isPaid, err := stripe.IsPaymentPaid(sessionID)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid session")
		return
	}

	type response struct {
		IsPaid bool `json:"is_paid"`
	}

	utils.RespondWithJSON(w, http.StatusOK, response{IsPaid: isPaid})
}