import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import { type AppEvent } from "../interfaces/event";
import {
  type ValidationStats,
  type ValidationFilters,
} from "../interfaces/validation";

// --- Types ---

export interface PendingDeposit {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  created_at: string;
  id_container: number;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
}

export interface PendingListing {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  price: number | null;
  created_at: string;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
}

export interface PaginatedDepositsResponse {
  deposits: PendingDeposit[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface PaginatedListingsResponse {
  listings: PendingListing[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface PaginatedEventsResponse {
  events: AppEvent[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

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
): Promise<PaginatedEventsResponse> => {
  const response = await api.get<PaginatedEventsResponse>(
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

export const fetchAllItemsHistory = async () => {
  const response = await api.get(ENDPOINTS.ADMIN.VALIDATIONS.HISTORY);
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
