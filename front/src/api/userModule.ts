import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { TotalScore, UserImpactStats, UserImpactItemsPagination, GlobalImpactStats } from "./interfaces/user";

export const getUserStats = async (): Promise<TotalScore> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.SCORE_STATS);
  return response.data;
};

export const getUserImpact = async (): Promise<UserImpactStats> => {
  const response = await api.get(ENDPOINTS.USER.IMPACT);
  return response.data;
};

export const getGlobalImpact = async (): Promise<GlobalImpactStats> => {
  const response = await api.get(ENDPOINTS.USER.GLOBAL_IMPACT);
  return response.data;
};

export const getUserImpactItems = async (
  page: number,
  limit: number,
): Promise<UserImpactItemsPagination> => {
  const response = await api.get(ENDPOINTS.USER.ITEMS, {
    params: { page, limit },
  });
  return response.data;
};
