import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllSubscriptions,
  getSubscriptionByID,
  revokeSubscription,
} from "../api/subscriptionModule";
import type { Subscription, SubscriptionListPagination } from "../api/interfaces/subscription";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useGetAllSubscriptions = (
  page: number = -1,
  limit: number = -1,
  active?: boolean,
) => {
  return useQuery<SubscriptionListPagination>({
    queryKey: ["subscriptions", page, limit, active],
    queryFn: () => getAllSubscriptions(page, limit, active),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "Subscriptions Error",
      errorMessage: "Unable to load subscriptions.",
    },
  });
};

export const useGetSubscriptionByID = (id: number) => {
  return useQuery<Subscription>({
    queryKey: ["subscriptionDetails", id],
    queryFn: () => getSubscriptionByID(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    meta: {
      errorTitle: "Subscription Error",
      errorMessage: `Could not load subscription #${id}`,
    },
  });
};

export const useRevokeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cancel_reason }: { id: number; cancel_reason: string }) =>
      revokeSubscription(id, cancel_reason),
    onSuccess: () => {
      showSuccessNotification("Revoked", "Subscription has been revoked");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    meta: {
      errorTitle: "Revoke Failed",
      errorMessage: "Could not revoke the subscription.",
    },
  });
};