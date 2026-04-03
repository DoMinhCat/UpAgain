import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteItem,
  getAllItems,
  getItemDetails,
  getItemStats,
  updateItemStatus,
} from "../api/itemModule";
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
      errorTitle: "Error",
      errorMessage: "Failed to fetch items",
    },
  });
};

export const useGetItemStats = (time?: string) => {
  return useQuery({
    queryKey: ["item-stats", time],
    queryFn: () => getItemStats(time),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch item stats",
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteItem(id),
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to delete item",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
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
      errorTitle: "Error",
      errorMessage: "Failed to fetch item details",
    },
  });
};

export const useUpdateItemStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateItemStatus(id, status),
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to update item status",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-stats"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
    },
  });
};
