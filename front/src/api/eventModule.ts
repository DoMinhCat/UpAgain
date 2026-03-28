import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import {
  type EventsListPagination,
  type AppEvent,
  type EventStats,
  type EventCreationPayload,
  type AssignedEmployee,
  type UnassignEmployeePayload,
  type UpdateEventPayload,
} from "./interfaces/event";

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

export const getEventStats = async (): Promise<EventStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS.STATS);
  return response.data;
};

export const createEvent = async (
  event: EventCreationPayload,
): Promise<void> => {
  const formData = new FormData();

  // Append all fields except 'images' to formData
  Object.entries(event).forEach(([key, value]) => {
    if (key !== "images" && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Append images from the FormData passed in the payload
  if (event.images) {
    event.images.forEach((value, key) => {
      formData.append(key, value);
    });
  }

  const response = await api.post(ENDPOINTS.ADMIN.EVENTS.ALL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getEventDetails = async (id_event: number): Promise<AppEvent> => {
  const response = await api.get(ENDPOINTS.ADMIN.EVENTS.ALL + id_event + "/");
  return response.data;
};

export const getAssignedEmployees = async (
  id_event: number,
): Promise<AssignedEmployee[]> => {
  const response = await api.get(
    ENDPOINTS.ADMIN.EVENTS.ASSIGNED_EMPLOYEES(id_event),
  );
  return response.data;
};

export const assignEmployeeToEvent = async (
  id_event: number,
  employee_ids: number[],
  start_at: string,
  end_at: string,
): Promise<void> => {
  const response = await api.post(ENDPOINTS.ADMIN.EVENTS.ASSIGN(id_event), {
    ids_employee: employee_ids,
    start_at,
    end_at,
  });
  return response.data;
};

export const unassignEmployee = async (
  id_event: number,
  id_employee: UnassignEmployeePayload,
): Promise<void> => {
  const response = await api.delete(ENDPOINTS.ADMIN.EVENTS.UNASSIGN(id_event), {
    data: id_employee,
  });
  return response.data;
};

export const updateEventStatus = async (
  id_event: number,
  status: string,
): Promise<void> => {
  const response = await api.patch(ENDPOINTS.ADMIN.EVENTS.CANCEL(id_event), {
    status,
  });
  return response.data;
};

export const updateEvent = async (
  id_event: number,
  event: UpdateEventPayload,
): Promise<void> => {
  const formData = new FormData();

  // Append all fields except 'images' to formData
  Object.entries(event).forEach(([key, value]) => {
    if (key !== "images" && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Append images from the FormData passed in the payload
  if (event.images) {
    event.images.forEach((value, key) => {
      formData.append(key, value);
    });
  }

  const response = await api.put(
    ENDPOINTS.ADMIN.EVENTS.UPDATE(id_event),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
