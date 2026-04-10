import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDepositCodesOfLatestTransaction,
  getDepositDetails,
  transferDepositContainer,
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

export const useTransferDepositContainer = (id_deposit: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id_new_container,
      id_current_container,
    }: {
      id_new_container: number;
      id_current_container: number;
    }) =>
      transferDepositContainer(
        id_deposit,
        id_new_container,
        id_current_container,
      ),
    meta: {
      errorTitle: "Transfer failed",
      errorMessage: "Failed to transfer deposit container",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-details", id_deposit] });
      queryClient.invalidateQueries({
        queryKey: ["depositDetails", id_deposit],
      });
      showSuccessNotification(
        "Container transferred",
        "Container transferred successfully",
      );
    },
  });
};
