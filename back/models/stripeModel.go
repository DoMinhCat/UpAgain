package models

type VerifyPaymentRequest struct {
	SessionID string `json:"session_id"`
}

type VerifyPaymentResponse struct {
	IsPaid bool `json:"is_paid"`
}