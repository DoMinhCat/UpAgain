import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { TotalScore, UserImpactStats, UserImpactItemsPagination } from "./interfaces/user";

export const getUserStats = async (): Promise<TotalScore> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.SCORE_STATS);
  return response.data;
};

export const getUserImpact = async (): Promise<UserImpactStats> => {
  const response = await api.get(ENDPOINTS.USER.IMPACT);
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
