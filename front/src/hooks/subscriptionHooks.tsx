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
) => {
  return useQuery<SubscriptionListPagination>({
    queryKey: ["subscriptions", page, limit, active],
    queryFn: () => getAllSubscriptions(page, limit, active),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "Subscriptions error",
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
      errorTitle: "Subscription error",
      errorMessage: `Could not load subscription #${id}`,
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
      showSuccessNotification("Revoked", "Subscription has been revoked");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionDetails", id] });
    },
    meta: {
      errorTitle: "Subscription cancelation failed",
      errorMessage: "Could not cancel the subscription.",
    },
  });
};

export const useGetSubscriptionPrice = () => {
  return useQuery<number>({
    queryKey: ["subscriptionPrice"],
    queryFn: getSubscriptionPrice,
    staleTime: 1000 * 60 * 5,
    meta: {
      errorTitle: "Error",
      errorMessage: "Could not load subscription price.",
    },
  });
};

export const useUpdateSubscriptionPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (price: number) => updateSubscriptionPrice(price),
    onSuccess: () => {
      showSuccessNotification("Updated", "Subscription price updated");
      queryClient.invalidateQueries({ queryKey: ["subscriptionPrice"] });
    },
    meta: {
      errorTitle: "Update Failed",
      errorMessage: "Could not update subscription price.",
    },
  });
};

export const useGetTrialDays = () => {
  return useQuery<number>({
    queryKey: ["trialDays"],
    queryFn: getTrialDays,
    staleTime: 1000 * 60 * 5,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load trial days.",
    },
  });
};

export const useUpdateTrialDays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trial_days: number) => updateTrialDays(trial_days),
    onSuccess: () => {
      showSuccessNotification("Updated", "Trial days updated");
      queryClient.invalidateQueries({ queryKey: ["trialDays"] });
    },
    meta: {
      errorTitle: "Update Failed",
      errorMessage: "Could not update trial days.",
    },
  });
};

export const useGetSubscriptionStats = (timeframe?: string) => {
  return useQuery<SubscriptionStats>({
    queryKey: ["subscriptionStats", timeframe],
    queryFn: () => getSubscriptionStats(timeframe),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "Stats Error",
      errorMessage: "Could not load subscription stats.",
    },
  });
};