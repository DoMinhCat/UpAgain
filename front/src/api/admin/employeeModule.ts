import { ENDPOINTS } from "../endpoints";
import { api } from "../axios";
import {
  type AvailableEmployeesRequest,
  type AvailableEmployeesResponse,
} from "../interfaces/employee";

export const getAvailableEmployees = async (
  request: AvailableEmployeesRequest,
): Promise<AvailableEmployeesResponse> => {
  const response = await api.get<AvailableEmployeesResponse>(
    ENDPOINTS.ADMIN.EMPLOYEES.AVAILABLE,
    { params: request },
  );
  return response.data;
};
