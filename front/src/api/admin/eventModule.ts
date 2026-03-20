import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";

export interface AppEvent {
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
  employee_name: string | null;
}

export interface EventsListPagination {
  events: AppEvent[];
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
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS.ALL, {
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
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS.STATS);
  return response.data;
};

export interface EventCreationPayload {
  title: string;
  description: string;
  start_at: string;
  price: number;
  category: string;
  capacity?: number;
  city: string;
  street: string;
  location_detail?: string;
  status: string;
}

export const createEvent = async (
  event: EventCreationPayload,
): Promise<void> => {
  const response = await api.post(ENDPOINTS.ADMIN.EVENTS.ALL, event);
  return response.data;
};

export const getEventDetails = async (id_event: number): Promise<AppEvent> => {
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS.ALL + id_event + "/");
  return response.data;
};

export const assignEmployeeToEvent = async (
  id_event: number,
  employee_ids: number[],
): Promise<void> => {
  const response = await api.post(
    ENDPOINTS.ADMIN.EVENTS.ASSIGN(id_event),
    employee_ids,
  );
  return response.data;
};
