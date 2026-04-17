import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  Subscription,
  SubscriptionListPagination,
  SubscriptionStats
} from "./interfaces/subscription";

export const getAllSubscriptions = async (
  page: number = 1,
  limit: number = 10,
  active?: boolean,
): Promise<SubscriptionListPagination> => {
  const params: Record<string, string | number | boolean> = {};
  if (page !== 1) params.page = page;
  if (limit !== 10) params.limit = limit;
  if (active !== undefined) params.active = active;

  const response = await api.get(ENDPOINTS.ADMIN.SUBSCRIPTIONS.ALL, { params });
  return response.data;
};

export const getSubscriptionByID = async (
  id: number,
): Promise<Subscription> => {
  const response = await api.get(`${ENDPOINTS.ADMIN.SUBSCRIPTIONS.ALL}${id}/`);
  return response.data;
};

export const revokeSubscription = async (
  id: number,
  cancel_reason: string,
): Promise<void> => {
  await api.put(`${ENDPOINTS.ADMIN.SUBSCRIPTIONS.ALL}${id}/revoke/`, {
    cancel_reason,
  });
};

export const getSubscriptionPrice = async (): Promise<number> => {
  const response = await api.get(ENDPOINTS.ADMIN.SUBSCRIPTIONS.PRICE);
  return response.data.price;
};

export const updateSubscriptionPrice = async (price: number): Promise<void> => {
  await api.put(ENDPOINTS.ADMIN.SUBSCRIPTIONS.PRICE, { price });
};

export const getTrialDays = async (): Promise<number> => {
  const response = await api.get(ENDPOINTS.ADMIN.SUBSCRIPTIONS.TRIAL);
  return response.data.trial_days;
};

export const updateTrialDays = async (trial_days: number): Promise<void> => {
  await api.put(ENDPOINTS.ADMIN.SUBSCRIPTIONS.TRIAL, { trial_days });
};

export const getSubscriptionStats = async (timeframe?: string): Promise<SubscriptionStats> => {
  const params: Record<string, string> = {};
  if (timeframe) params.timeframe = timeframe;
  const response = await api.get(ENDPOINTS.ADMIN.SUBSCRIPTIONS.STATS, { params });
  return response.data;
};