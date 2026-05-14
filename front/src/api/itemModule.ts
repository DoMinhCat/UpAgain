import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  CreateItemRequest,
  Item,
  ItemAdminStats,
  ItemsListPagination,
} from "./interfaces/item";
import type { TransactionsPagination } from "./interfaces/transaction";

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
  page?: number,
  limit?: number,
): Promise<TransactionsPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.ITEMS.TRANSACTIONS(id), {
    params: { page, limit },
  });
  return response.data;
};

export const cancelTransaction = async (
  id: number,
  transactionUuid: string,
) => {
  await api.post(ENDPOINTS.ADMIN.ITEMS.CANCEL_TRANSACTION(id, transactionUuid));
};

export const createItem = async (payload: CreateItemRequest): Promise<void> => {
  const formData = new FormData();

  // Append root level fields
  Object.entries(payload).forEach(([key, value]) => {
    if (
      key !== "images" &&
      key !== "listing_info" &&
      key !== "deposit_info" &&
      value !== undefined
    ) {
      formData.append(key, String(value));
    }
  });

  // Flatten listing_info
  if (payload.listing_info) {
    Object.entries(payload.listing_info).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  // Flatten deposit_info
  if (payload.deposit_info) {
    Object.entries(payload.deposit_info).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  // Append images
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  const response = await api.post(ENDPOINTS.ITEMS.NEW, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyItems = async (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
): Promise<ItemsListPagination> => {
  const response = await api.get(ENDPOINTS.ITEMS.ME, {
    params: { page, limit, search, sort, status, material, category },
  });
  return response.data;
};
