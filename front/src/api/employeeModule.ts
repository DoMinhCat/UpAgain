import { ENDPOINTS } from "./endpoints";
import { api } from "./axios";
import {
  type AvailableEmployeesRequest,
  type AvailableEmployeesResponse,
} from "./interfaces/employee";
import { type AppEvent } from "./interfaces/event";

export const getAvailableEmployees = async (
  request: AvailableEmployeesRequest,
): Promise<AvailableEmployeesResponse> => {
  const response = await api.get<AvailableEmployeesResponse>(
    ENDPOINTS.ADMIN.EMPLOYEES.AVAILABLE,
    { params: request },
  );
  return response.data;
};

export const getEmployeeSchedule = async (
  id_employee: number,
): Promise<AppEvent[]> => {
  const response = await api.get<AppEvent[]>(
    ENDPOINTS.ADMIN.EMPLOYEES.SCHEDULE(id_employee),
  );
  return response.data;
};
