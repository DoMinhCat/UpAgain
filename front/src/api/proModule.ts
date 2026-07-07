import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { ProAnalyticsResponse } from "./interfaces/pro";

export const getProAnalytics = async (
  id_account: number,
  timeframe?: string,
): Promise<ProAnalyticsResponse> => {
  const url = timeframe
    ? `${ENDPOINTS.ACCOUNTS.PRO_ANALYTICS(id_account)}?timeframe=${timeframe}`
    : ENDPOINTS.ACCOUNTS.PRO_ANALYTICS(id_account);
  const response = await api.get(url);
  return response.data;
};

export const getProAlertMaterials = async (
  id_account: number,
): Promise<string[]> => {
  const response = await api.get(
    ENDPOINTS.ACCOUNTS.PRO_ALERT_MATERIALS(id_account),
  );
  return response.data;
};

export const updateProAlertMaterials = async (
  id_account: number,
  materials: string[],
): Promise<void> => {
  await api.put(ENDPOINTS.ACCOUNTS.PRO_ALERT_MATERIALS(id_account), {
    materials,
  });
};
