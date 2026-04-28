import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  StripePaymentVerificationResponse,
  StripePaymentVerificationRequest,
} from "./interfaces/stripe";

export const verifyStripeSession = async (
  payload: StripePaymentVerificationRequest,
): Promise<StripePaymentVerificationResponse> => {
  const response = await api.post<StripePaymentVerificationResponse>(
    ENDPOINTS.STRIPE.VERIFY,
    payload,
  );

  return response.data;
};
