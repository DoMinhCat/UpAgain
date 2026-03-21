import { useQuery, useMutation } from "@tanstack/react-query";
import { getAvailableEmployees } from "../api/admin/employeeModule";
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
