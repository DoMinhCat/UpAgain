import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export const getBackendLogs = async (): Promise<string> => {
  const response = await api.get(ENDPOINTS.ADMIN.LOGS, {
    responseType: "text",
  });
  return response.data;
};
