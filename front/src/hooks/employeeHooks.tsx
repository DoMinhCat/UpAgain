import { useQuery } from "@tanstack/react-query";
import {
  getAvailableEmployees,
  getEmployeeSchedule,
} from "../api/employeeModule";
import { type AvailableEmployeesRequest } from "../api/interfaces/employee";

const STALE_TIME = 60 * 1000;

export const useGetAvailableEmployees = (
  request: AvailableEmployeesRequest,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["availableEmployees", request],
    queryFn: () => getAvailableEmployees(request),
    staleTime: STALE_TIME,
    enabled,
    meta: {
      errorTitle: "admin:events.details.assigned_employees.error_fetching_available",
      errorMessage: "admin:events.details.assigned_employees.error_fetching_available",
    },
  });
};

export const useGetEmployeeSchedule = (
  id_employee: number,
  isValidEmployeeId: boolean,
) => {
  return useQuery({
    queryKey: ["employeeSchedule", id_employee],
    queryFn: () => getEmployeeSchedule(id_employee),
    staleTime: STALE_TIME,
    enabled: isValidEmployeeId,
    meta: {
      errorTitle: "admin:events.details.assigned_employees.error_fetching_schedule",
      errorMessage: "admin:events.details.assigned_employees.error_fetching_schedule",
    },
  });
};
