import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { ItemAdminStats, ItemsListPagination } from "./interfaces/item";

export const getAllItems = async (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
): Promise<ItemsListPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.ALL, {
    params: { page, limit, search, sort, status, material, category },
  });
  return response.data;
};

export const getItemStats = async (): Promise<ItemAdminStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.COUNT);
  return response.data;
};
