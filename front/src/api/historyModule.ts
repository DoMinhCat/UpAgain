import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { HistoryListPagination } from "./interfaces/history";

export const getAllHistories = async (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  module?: string,
  action?: string,
): Promise<HistoryListPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.HISTORIES.ALL, {
    params: { page, limit, search, sort, module, action },
  });
  return response.data;
};
