import { useQuery } from "@tanstack/react-query";
import { getDepositDetails } from "../api/depositModule";

const STALE_TIME = 60 * 1000;

export const useGetDepositDetails = (id: number, isValid: boolean) => {
  return useQuery({
    queryKey: ["depositDetails", id],
    queryFn: () => getDepositDetails(id),
    enabled: isValid,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error fetching deposit details",
      errorMessage: "Failed to fetch deposit details",
    },
  });
};
