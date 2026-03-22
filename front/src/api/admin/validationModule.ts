import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import {
  type ValidationStats,
  type ValidationFilters,
} from "../interfaces/validation";
import { type PaginatedDepositsResponse } from "../interfaces/deposit";
import { type PaginatedListingsResponse } from "../interfaces/listing";
import { type EventsListPagination } from "../interfaces/event";
import { type PaginatedHistoryResponse } from "../interfaces/item";

// --- API functions ---

export const fetchPendingDeposits = async (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
): Promise<PaginatedDepositsResponse> => {
  const response = await api.get<PaginatedDepositsResponse>(
    ENDPOINTS.ADMIN.VALIDATIONS.DEPOSITS,
    { params: { page, limit, ...filters } },
  );
  return response.data;
};

export const fetchPendingListings = async (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
): Promise<PaginatedListingsResponse> => {
  const response = await api.get<PaginatedListingsResponse>(
    ENDPOINTS.ADMIN.VALIDATIONS.LISTINGS,
    { params: { page, limit, ...filters } },
  );
  return response.data;
};

export const fetchPendingEvents = async (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
): Promise<EventsListPagination> => {
  const response = await api.get<EventsListPagination>(
    ENDPOINTS.ADMIN.VALIDATIONS.EVENTS,
    { params: { page, limit, ...filters } },
  );
  return response.data;
};

export const fetchValidationStats = async (): Promise<ValidationStats> => {
  const response = await api.get<ValidationStats>(
    ENDPOINTS.ADMIN.VALIDATIONS.STATS,
  );
  return response.data;
};

export const fetchAllItemsHistory = async (
  page?: number,
  limit?: number,
  filters?: ValidationFilters,
): Promise<PaginatedHistoryResponse> => {
  const response = await api.get<PaginatedHistoryResponse>(
    ENDPOINTS.ADMIN.VALIDATIONS.HISTORY,
    { params: { page, limit, ...filters } },
  );
  return response.data;
};

export const processValidationAction = async (
  entityType: "listings" | "deposits" | "events",
  id: number,
  action: "approve" | "refuse",
  reason?: string,
): Promise<{ message: string }> => {
  const payload = { action, reason: reason || "" };
  const url = ENDPOINTS.ADMIN.VALIDATIONS.ACTION(entityType, id);
  const response = await api.put(url, payload);
  return response.data;
};
