import { useQuery } from "@tanstack/react-query";
import { getListingDetails } from "../api/listingModule";

const STALE_TIME = 60 * 1000;

export const useGetListingDetails = (id: number, isValid: boolean) => {
  return useQuery({
    queryKey: ["listingDetails", id],
    queryFn: () => getListingDetails(id),
    enabled: isValid,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error fetching listing details",
      errorMessage: "Failed to fetch listing details",
    },
  });
};
