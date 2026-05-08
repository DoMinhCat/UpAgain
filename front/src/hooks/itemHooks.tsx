import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelTransaction,
  createItem,
  deleteItem,
  getAllItems,
  getItemDetails,
  getItemStats,
  getItemTransactions,
  updateItemStatus,
} from "../api/itemModule";
import { showSuccessNotification } from "../components/common/NotificationToast";
import type { CreateItemRequest } from "../api/interfaces/item";
const STALE_TIME = 60 * 1000;
export const useGetAllItems = (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
) => {
  return useQuery({
    queryKey: ["items", page, limit, search, sort, status, material, category],
    queryFn: () =>
      getAllItems(page, limit, search, sort, status, material, category),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.fetch_items_error",
    },
  });
};

export const useGetItemStats = (time?: string) => {
  return useQuery({
    queryKey: ["item-stats", time],
    queryFn: () => getItemStats(time),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.fetch_stats_error",
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteItem(id),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.delete_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      showSuccessNotification(
        "marketplace:notifications.delete_success_title",
        "marketplace:notifications.delete_success_message",
      );
    },
  });
};

export const useGetItemDetails = (id: number, isValidId: boolean) => {
  return useQuery({
    queryKey: ["item-details", id],
    queryFn: () => getItemDetails(id),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.fetch_detail_error",
    },
  });
};

export const useUpdateItemStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateItemStatus(id, status),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.update_status_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
    },
  });
};

export const useGetItemTransactions = (
  id_item: number,
  isValidId: boolean,
  page?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: ["item-transactions", id_item, page, limit],
    queryFn: () => getItemTransactions(id_item, page, limit),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.fetch_transactions_error",
    },
  });
};

export const useCancelTransaction = (id_item: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionUuid: string) =>
      cancelTransaction(id_item, transactionUuid),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.cancel_transaction_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["item-transactions", id_item],
      });
      showSuccessNotification(
        "marketplace:notifications.cancel_transaction_success_title",
        "marketplace:notifications.cancel_transaction_success_message",
      );
    },
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemRequest) => createItem(payload),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.post_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      showSuccessNotification(
        "marketplace:notifications.post_success_title",
        "marketplace:notifications.post_success_message",
      );
    },
  });
};
