import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDepositCodesOfLatestTransaction,
  getDepositDetails,
  updateDeposit,
} from "../api/depositModule";
import { showSuccessNotification } from "../components/NotificationToast";

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

export const useUpdateDeposit = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => updateDeposit(id, payload),
    meta: {
      errorTitle: "Error updating deposit",
      errorMessage: "Failed to update deposit",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      queryClient.invalidateQueries({ queryKey: ["depositDetails", id] });
      showSuccessNotification(
        "Deposit updated",
        "Deposit updated successfully",
      );
    },
  });
};

export const useGetDepositCodesOfLatestTransaction = (
  id: number,
  isValidId: boolean,
) => {
  return useQuery({
    queryKey: ["depositCodes", id],
    queryFn: () => getDepositCodesOfLatestTransaction(id),
    enabled: isValidId,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error fetching deposit codes",
      errorMessage: "Failed to fetch deposit codes",
    },
  });
};
