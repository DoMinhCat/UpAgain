import { useMutation } from "@tanstack/react-query";
import type { StripePaymentVerificationRequest } from "../api/interfaces/stripe";
import { verifyStripeSession } from "../api/stripeModule";

export const useVerifyStripeSession = () => {
  return useMutation({
    mutationFn: (payload: StripePaymentVerificationRequest) =>
      verifyStripeSession(payload),
    meta: {
      errorTitle: "Payment verification failed",
      errorMessage: "Could not verify payment session.",
    },
  });
};
