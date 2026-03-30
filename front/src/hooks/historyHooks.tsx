import { useQuery } from "@tanstack/react-query";
import { getAllHistories, getHistoryDetails } from "../api/historyModule";

export const useGetAdminHistory = (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  module?: string,
  action?: string,
) => {
  return useQuery({
    queryKey: ["histories", page, limit, search, sort, module, action],
    queryFn: () => getAllHistories(page, limit, search, sort, module, action),
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch admin history.",
    },
  });
};

export const useGetHistoryDetails = (id_history: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["history", id_history],
    queryFn: () => getHistoryDetails(id_history),
    enabled: enabled,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch history details.",
    },
  });
};
