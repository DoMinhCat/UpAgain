import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelItemReservation,
  confirmItemRetrieval,
  createItem,
  deleteItem,
  getAllItems,
  getItemDetails,
  getItemStats,
  getItemTransactions,
  getLatestTransaction,
  getMyItems,
  purchaseItem,
  reserveItem,
  updateItemStatus,
} from "../api/itemModule";
import { showSuccessNotification } from "../components/common/NotificationToast";
import type {
  CreateItemRequest,
  ItemPurchasePayload,
} from "../api/interfaces/item";
import type { ConfirmCodeRequest } from "../api/interfaces/barcode";
const STALE_TIME = 60 * 1000;
export const useGetAllItems = (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
  include_purchased?: boolean,
) => {
  return useQuery({
    queryKey: [
      "items",
      page,
      limit,
      search,
      sort,
      status,
      material,
      category,
      include_purchased,
    ],
    queryFn: () =>
      getAllItems(
        page,
        limit,
        search,
        sort,
        status,
        material,
        category,
        include_purchased,
      ),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.fetch_items_error",
    },
  });
};

export const useGetMyItems = (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
) => {
  return useQuery({
    queryKey: [
      "my-items",
      page,
      limit,
      search,
      sort,
      status,
      material,
      category,
    ],
    queryFn: () =>
      getMyItems(page, limit, search, sort, status, material, category),
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

export const useCancelItemReservation = (id_item: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelItemReservation(id_item),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.cancel_transaction_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["item-transactions", id_item],
      });
      queryClient.invalidateQueries({
        queryKey: ["item-details", id_item],
      });
      queryClient.invalidateQueries({
        queryKey: ["latest-transaction-of-pro", id_item],
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
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      showSuccessNotification(
        "marketplace:notifications.post_success_title",
        "marketplace:notifications.post_success_message",
      );
    },
  });
};

export const useGetLatestTransactionOfPro = (
  id: number,
  isValidId: boolean,
) => {
  return useQuery({
    queryKey: ["latest-transaction-of-pro", id],
    queryFn: () => getLatestTransaction(id),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "Failed to retrieve transaction's detail",
      errorMessage: "An error occurred while fetching transaction's detail",
    },
  });
};

export const useReserveItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reserveItem(id),
    meta: {
      errorTitle: "Reservation failed",
      errorMessage: "Failed to reserve item, please try again later",
    },
    onSuccess: (_, id: number) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      queryClient.invalidateQueries({
        queryKey: ["latest-transaction-of-pro"],
      });
      showSuccessNotification(
        "marketplace:notifications.reserve_success_title",
        "marketplace:notifications.reserve_success_message",
      );
    },
  });
};

export const usePurchaseItem = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemPurchasePayload) => purchaseItem(id, payload),
    meta: {
      errorTitle: "Purchase failed",
      errorMessage: "Failed to purchase item, please try again later",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({
        queryKey: ["latest-transaction-of-pro", id],
      });
    },
  });
};

export const useConfirmItemRetrieval = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmCodeRequest) =>
      confirmItemRetrieval(id, payload),
    meta: {
      errorTitle: "Retrieval confirmation failed",
      errorMessage: "Failed to confirm item's retrieval",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({
        queryKey: ["latest-transaction-of-pro", id],
      });
      queryClient.invalidateQueries({ queryKey: ["userImpactItems"] });
      queryClient.invalidateQueries({ queryKey: ["userImpact"] });
      showSuccessNotification("Retrieval confirmed", "You are all set");
    },
  });
};
