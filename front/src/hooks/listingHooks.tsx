import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListingDetails, updateListing } from "../api/listingModule";
import { showSuccessNotification } from "../components/common/NotificationToast";

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

export const useUpdateListing = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => updateListing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listingDetails", id] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      showSuccessNotification(
        "Listing updated",
        "Listing updated successfully",
      );
    },
    meta: {
      errorTitle: "Error updating listing",
      errorMessage: "Failed to update listing",
    },
  });
};
