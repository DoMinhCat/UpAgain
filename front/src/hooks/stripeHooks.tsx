import { useMutation } from "@tanstack/react-query";
import type { StripePaymentVerificationRequest } from "../api/interfaces/stripe";
import { verifyStripeSession } from "../api/stripeModule";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useRegisterToEvent } from "./eventHooks";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../components/common/NotificationToast";
import { useTranslation } from "react-i18next";

export const useVerifyStripeSession = () => {
  const { t } = useTranslation(["common"]);
  return useMutation({
    mutationFn: (payload: StripePaymentVerificationRequest) =>
      verifyStripeSession(payload),
    meta: {
      errorTitle: t("common:stripe.verification_failed"),
      errorMessage: t("common:stripe.verification_error"),
    },
  });
};

export const useHandleStripeEventRegistration = (fallbackEventId?: number) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyStripeSessionMutation = useVerifyStripeSession();
  const registerToEvent = useRegisterToEvent();
  const { t } = useTranslation(["events", "common"]);

  useEffect(() => {
    const status = searchParams.get("payment");
    const sessionId = searchParams.get("sessionid");
    const idEventStr = searchParams.get("event_id");

    let idEvent = fallbackEventId || 0;
    if (idEventStr) {
      idEvent = parseInt(idEventStr, 10);
    }

    if (status === "success" && sessionId && !isNaN(idEvent) && idEvent > 0) {
      verifyStripeSessionMutation.mutate(
        { session_id: sessionId },
        {
          onSuccess: (data) => {
            if (data.is_paid) {
              registerToEvent.mutate(
                { id_event: idEvent, paid: true },
                {
                  onSuccess: () => {
                    showSuccessNotification(
                      t("events:detail.register_success_title"),
                      t("events:detail.register_success_msg"),
                    );
                    searchParams.delete("payment");
                    searchParams.delete("sessionid");
                    searchParams.delete("event_id");
                    setSearchParams(searchParams);
                  },
                },
              );
            } else {
              showErrorNotification(
                t("events:detail.register_failed_title", {
                  defaultValue: "Registration failed",
                }),
                t("events:detail.register_failed_msg", {
                  defaultValue: "Payment not completed",
                }),
              );
              searchParams.delete("payment");
              searchParams.delete("sessionid");
              searchParams.delete("event_id");
              setSearchParams(searchParams);
            }
          },
        },
      );
    } else if (status === "cancelled" || status === "cancel") {
      showErrorNotification(
        t("events:detail.register_cancelled_title", {
          defaultValue: "Registration cancelled",
        }),
        t("events:detail.register_cancelled_msg", {
          defaultValue: "Payment was cancelled",
        }),
      );
      searchParams.delete("payment");
      searchParams.delete("sessionid");
      searchParams.delete("event_id");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  return {
    isVerifying:
      verifyStripeSessionMutation.isPending || registerToEvent.isPending,
  };
};
