import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StripePaymentVerificationRequest } from "../api/interfaces/stripe";
import { verifyStripeSession } from "../api/stripeModule";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useRegisterToEvent } from "./eventHooks";
import {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
} from "../components/common/NotificationToast";
import { useTranslation } from "react-i18next";
import { usePurchaseItem } from "./itemHooks";
import { PATHS } from "../routes/paths";

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

export const useHandleVerifyStripeEventRegistration = (
  fallbackEventId?: number,
) => {
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
      showInfoNotification(
        t("events:detail.register_cancelled_title", {
          defaultValue: "Registration cancelled",
        }),
        t("events:detail.register_cancelled_msg"),
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

export const useHandleVerifyItemPurchase = (id_item: number) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyStripeSessionMutation = useVerifyStripeSession();
  const purchaseItem = usePurchaseItem(id_item);
  const queryClient = useQueryClient();

  useEffect(() => {
    const status = searchParams.get("payment");
    const sessionId = searchParams.get("sessionid");

    // when redirected back from stripe url with param "success", verify with backend
    if (status === "success" && sessionId && !isNaN(id_item) && id_item > 0) {
      verifyStripeSessionMutation.mutate(
        { session_id: sessionId },
        {
          onSuccess: (data) => {
            // backend confirm payment is done
            if (data.is_paid) {
              purchaseItem.mutate(
                { paid: true },
                {
                  onSuccess: () => {
                    showSuccessNotification(
                      "Purchase completed",
                      "Item has been purchased successfully",
                    );
                    searchParams.delete("payment");
                    searchParams.delete("sessionid");
                    setSearchParams(searchParams);
                    queryClient.invalidateQueries({ queryKey: ["items"] });
                    queryClient.invalidateQueries({ queryKey: ["item-stats"] });
                    queryClient.invalidateQueries({
                      queryKey: ["item-details", id_item],
                    });
                    queryClient.invalidateQueries({ queryKey: ["my-items"] });
                    queryClient.invalidateQueries({
                      queryKey: ["latest-transaction-of-pro", id_item],
                    });
                    navigate(PATHS.MARKETPLACE.ME);
                  },
                },
              );
            } else {
              showErrorNotification("Purchase failed", "Payment not completed");
              searchParams.delete("payment");
              searchParams.delete("sessionid");
              setSearchParams(searchParams);
            }
          },
        },
      );
      // if user cancel payment
    } else if (status === "cancelled" || status === "cancel") {
      showInfoNotification(
        "Purchase cancelled",
        "You have cancelled the purchase",
      );
      searchParams.delete("payment");
      searchParams.delete("sessionid");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  return {
    isVerifying:
      verifyStripeSessionMutation.isPending || purchaseItem.isPending,
  };
};
