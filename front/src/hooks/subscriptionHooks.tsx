import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllSubscriptions,
  getSubscriptionByID,
  revokeSubscription,
  updateSubscriptionPrice,
  getSubscriptionPrice,
  getTrialDays,
  updateTrialDays,
  getSubscriptionStats,
} from "../api/subscriptionModule";
import type {
  Subscription,
  SubscriptionListPagination,
  SubscriptionStats,
} from "../api/interfaces/subscription";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useGetAllSubscriptions = (
  page: number = -1,
  limit: number = -1,
  active?: boolean,
  search?: string,
  sort?: string,
  isTrial?: boolean,
) => {
  return useQuery<SubscriptionListPagination>({
    queryKey: ["subscriptions", page, limit, active, search, sort, isTrial],
    queryFn: () =>
      getAllSubscriptions(page, limit, active, search, sort, isTrial),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_loading_subscriptions",
      errorMessage: "admin:subscriptions.notifications.error_loading_subscriptions",
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
      errorTitle: "admin:subscriptions.notifications.error_loading_details",
      errorMessage: "admin:subscriptions.notifications.error_loading_details",
    },
  });
};

export const useRevokeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      cancel_reason,
    }: {
      id: number;
      cancel_reason: string;
    }) => revokeSubscription(id, cancel_reason),
    onSuccess: (_, { id }) => {
      showSuccessNotification(
        "admin:subscriptions.notifications.revoke_success_title",
        "admin:subscriptions.notifications.revoke_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionDetails", id] });
    },
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_revoking",
      errorMessage: "admin:subscriptions.notifications.error_revoking",
    },
  });
};

export const useGetSubscriptionPrice = () => {
  return useQuery<number>({
    queryKey: ["subscriptionPrice"],
    queryFn: getSubscriptionPrice,
    staleTime: 1000 * 60 * 5,
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_loading_price",
      errorMessage: "admin:subscriptions.notifications.error_loading_price",
    },
  });
};

export const useUpdateSubscriptionPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (price: number) => updateSubscriptionPrice(price),
    onSuccess: () => {
      showSuccessNotification(
        "admin:subscriptions.notifications.update_price_success_title",
        "admin:subscriptions.notifications.update_price_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["subscriptionPrice"] });
    },
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_updating_price",
      errorMessage: "admin:subscriptions.notifications.error_updating_price",
    },
  });
};

export const useGetTrialDays = () => {
  return useQuery<number>({
    queryKey: ["trialDays"],
    queryFn: getTrialDays,
    staleTime: 1000 * 60 * 5,
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_loading_trial",
      errorMessage: "admin:subscriptions.notifications.error_loading_trial",
    },
  });
};

export const useUpdateTrialDays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trial_days: number) => updateTrialDays(trial_days),
    onSuccess: () => {
      showSuccessNotification(
        "admin:subscriptions.notifications.update_trial_success_title",
        "admin:subscriptions.notifications.update_trial_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["trialDays"] });
    },
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_updating_trial",
      errorMessage: "admin:subscriptions.notifications.error_updating_trial",
    },
  });
};

export const useGetSubscriptionStats = (timeframe?: string) => {
  return useQuery<SubscriptionStats>({
    queryKey: ["subscriptionStats", timeframe],
    queryFn: () => getSubscriptionStats(timeframe),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "admin:subscriptions.notifications.error_loading_stats",
      errorMessage: "admin:subscriptions.notifications.error_loading_stats",
    },
  });
};
