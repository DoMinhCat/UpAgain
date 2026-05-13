import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingDeposits,
  fetchPendingListings,
  fetchPendingEvents,
  fetchValidationStats,
  fetchAllItemsHistory,
  processValidationAction,
} from "../api/validationModule";
import {
  type ValidationFilters,
  type ValidationStats,
} from "../api/interfaces/validation";
import { type PaginatedDepositsResponse } from "../api/interfaces/deposit";
import { type PaginatedListingsResponse } from "../api/interfaces/listing";
import { type EventsListPagination } from "../api/interfaces/event";
import { type PaginatedHistoryResponse } from "../api/interfaces/item";
import { showSuccessNotification } from "../components/common/NotificationToast";

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
      errorTitle: "admin:validations.notifications.error_loading_deposits",
      errorMessage: "admin:validations.notifications.error_loading_deposits",
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
      errorTitle: "admin:validations.notifications.error_loading_listings",
      errorMessage: "admin:validations.notifications.error_loading_listings",
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
      errorTitle: "admin:validations.notifications.error_loading_events",
      errorMessage: "admin:validations.notifications.error_loading_events",
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
      errorTitle: "admin:validations.notifications.error_loading_stats",
      errorMessage: "admin:validations.notifications.error_loading_stats",
    },
  });
};

// --- History hook ---

export const useAllItemsHistory = (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
) => {
  return useQuery<PaginatedHistoryResponse>({
    queryKey: [
      "allItemsHistory",
      page,
      limit,
      filters?.search,
      filters?.sort,
      filters?.status,
      filters?.type,
    ],
    queryFn: () => fetchAllItemsHistory(page, limit, filters),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:validations.notifications.error_loading_history",
      errorMessage: "admin:validations.notifications.error_loading_history",
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
    onSuccess: (_data, { action, id }) => {
      showSuccessNotification(
        action === "approve"
          ? "admin:validations.notifications.approve_success_title"
          : "admin:validations.notifications.refuse_success_title",
        action === "approve"
          ? "admin:validations.notifications.approve_success_message"
          : "admin:validations.notifications.refuse_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["pendingDeposits"] });
      queryClient.invalidateQueries({ queryKey: ["pendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
      queryClient.invalidateQueries({ queryKey: ["allItemsHistory"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
    },
    meta: {
      errorTitle: "admin:validations.notifications.error_processing",
      errorMessage: "admin:validations.notifications.error_processing",
    },
  });
};
