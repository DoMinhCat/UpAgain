import { useQuery } from "@tanstack/react-query";
import { getAllHistories } from "../api/historyModule";

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
      errorMessage: "Failed to fetch admin activities.",
    },
  });
};
