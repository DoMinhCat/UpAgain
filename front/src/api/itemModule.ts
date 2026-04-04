import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  Item,
  ItemAdminStats,
  ItemsListPagination,
} from "./interfaces/item";
import type { Transaction } from "./interfaces/transaction";

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

export const getItemStats = async (time?: string): Promise<ItemAdminStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.COUNT, {
    params: { timeframe: time },
  });
  return response.data;
};

export const deleteItem = async (id: number) => {
  await api.delete(ENDPOINTS.ADMIN.ITEMS.DELETE(id));
};

export const updateItemStatus = async (id: number, status: string) => {
  await api.patch(ENDPOINTS.ADMIN.ITEMS.DETAILS(id), { status });
};

export const getItemDetails = async (id: number): Promise<Item> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.DETAILS(id));
  return response.data;
};

export const getItemTransactions = async (
  id: number,
): Promise<Transaction[]> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.TRANSACTIONS(id));
  return response.data;
};
