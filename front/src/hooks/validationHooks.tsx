import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingDeposits,
  fetchPendingListings,
  fetchPendingEvents,
  fetchValidationStats,
  fetchAllItemsHistory,
  processValidationAction,
} from "../api/admin/validationModule";
import {
  type ValidationFilters,
  type ValidationStats,
} from "../api/interfaces/validation";
import { type PaginatedDepositsResponse } from "../api/interfaces/deposit";
import { type PaginatedListingsResponse } from "../api/interfaces/listing";
import { type EventsListPagination } from "../api/interfaces/event";
import { type PaginatedHistoryResponse } from "../api/interfaces/item";

const STALE_TIME = 1000 * 60; // 1min

// --- Paginated pending hooks ---

export const usePendingDeposits = (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
) => {
  return useQuery<PaginatedDepositsResponse>({
    queryKey: ["pendingDeposits", page, limit, filters?.search, filters?.sort],
    queryFn: () => fetchPendingDeposits(page, limit, filters),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load pending deposits",
    },
  });
};

export const usePendingListings = (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
) => {
  return useQuery<PaginatedListingsResponse>({
    queryKey: ["pendingListings", page, limit, filters?.search, filters?.sort],
    queryFn: () => fetchPendingListings(page, limit, filters),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load pending listings",
    },
  });
};

export const usePendingEvents = (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
) => {
  return useQuery<EventsListPagination>({
    queryKey: ["pendingEvents", page, limit, filters?.search, filters?.sort],
    queryFn: () => fetchPendingEvents(page, limit, filters),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load pending events",
    },
  });
};

// --- Stats hook ---

export const useValidationStats = () => {
  return useQuery<ValidationStats>({
    queryKey: ["validationStats"],
    queryFn: fetchValidationStats,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load validation statistics",
    },
  });
};

// --- History hook ---

export const useAllItemsHistory = (page?: number, limit?: number) => {
  return useQuery<PaginatedHistoryResponse>({
    queryKey: ["allItemsHistory", page, limit],
    queryFn: () => fetchAllItemsHistory(page, limit),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load items history",
    },
  });
};

// --- Process action mutation ---

interface ProcessValidationParams {
  entityType: "listings" | "deposits" | "events";
  id: number;
  action: "approve" | "refuse";
  reason?: string;
}

export const useProcessValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, id, action, reason }: ProcessValidationParams) =>
      processValidationAction(entityType, id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingDeposits"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["pendingEvents"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
      queryClient.invalidateQueries({ queryKey: ["allItemsHistory"] });
    },
    meta: {
      errorTitle: "Validation Failed",
      errorMessage: "Could not process the validation action",
    },
  });
};
