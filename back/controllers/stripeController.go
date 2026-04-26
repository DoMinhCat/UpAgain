package controllers

import (
	"backend/models"
	"backend/utils"
	stripe "backend/utils/stripe"
	"encoding/json"
	"net/http"
)

// VerifyPayment godoc
// @Summary      Verify Stripe payment session
// @Description  Verify if a Stripe checkout session has been paid.
// @Tags         payment
// @Accept       json
// @Produce      json
// @Param        payload  body      models.VerifyPaymentRequest  true  "Stripe session ID"
// @Success      200      {object}  models.VerifyPaymentResponse "Payment verification result"
// @Failure      400      {object}  nil                          "Invalid payload or session"
// @Router       /payments/verify/ [post]
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
