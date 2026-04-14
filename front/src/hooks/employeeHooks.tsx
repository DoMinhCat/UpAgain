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
      errorTitle: "Error",
      errorMessage: "Unable to fetch employees.",
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
      errorTitle: "Error",
      errorMessage: "Unable to fetch employee's schedule.",
    },
  });
};
