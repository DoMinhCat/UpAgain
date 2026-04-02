import { useQuery } from "@tanstack/react-query";
import { getAllItems, getItemStats } from "../api/itemModule";
const STALE_TIME = 60 * 1000;
export const useGetAllItems = (
  page?: number,
  limit?: number,
  search?: string,
  sort?: string,
  status?: string,
  material?: string,
  category?: string,
) => {
  return useQuery({
    queryKey: ["items", page, limit, search, sort, status, material, category],
    queryFn: () =>
      getAllItems(page, limit, search, sort, status, material, category),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch items",
    },
  });
};

export const useGetItemStats = () => {
  return useQuery({
    queryKey: ["item-stats"],
    queryFn: () => getItemStats(),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch item stats",
    },
  });
};
