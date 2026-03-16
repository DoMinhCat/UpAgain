import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";

export interface Event {
  id: number;
  created_at: string;
  title: string;
  description: string;
  start_at: string;
  price: number;
  category: string;
  capacity: number;
  status: string;
  city: string;
  street: string;
  location_detail: string;
}

export interface EventsListPagination {
  events: Event[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

// get active or deleted events
export const getAllEvents = async (
  page?: number,
  limit?: number,
  search?: string,
  status?: string,
  sort?: string,
): Promise<EventsListPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS, {
    params: { page, limit, search, status, sort },
  });
  return response.data;
};

export interface EventStats {
  total: number;
  increase: number;
  upcoming: number;
  registrations: number;
  pending: number;
}

export const getEventStats = async (): Promise<EventStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS_COUNT);
  return response.data;
};
