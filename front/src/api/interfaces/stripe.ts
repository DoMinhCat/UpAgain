export interface StripePaymentVerificationResponse {
  is_paid: boolean;
}

export interface StripePaymentVerificationRequest {
  session_id: string;
}
