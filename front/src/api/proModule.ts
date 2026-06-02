import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { ProAnalyticsResponse } from "./interfaces/pro";

export const getProAnalytics = async (
  id_account: number,
): Promise<ProAnalyticsResponse> => {
  const response = await api.get(ENDPOINTS.ACCOUNTS.PRO_ANALYTICS(id_account));
  return response.data;
};
