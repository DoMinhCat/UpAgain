import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDepositDetails,
  transferDepositContainer,
  updateDeposit,
} from "../api/depositModule";
import { getDepositCodesOfLatestTransaction } from "../api/barcodeModule";
import { showSuccessNotification } from "../components/common/NotificationToast";

const STALE_TIME = 60 * 1000;

export const useGetDepositDetails = (id: number, isValid: boolean) => {
  return useQuery({
    queryKey: ["depositDetails", id],
    queryFn: () => getDepositDetails(id),
    enabled: isValid,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "admin:listings.notifications.fetch_deposit_details_error",
    },
  });
};

export const useUpdateDeposit = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => updateDeposit(id, payload),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:notifications.update_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item-details", id] });
      queryClient.invalidateQueries({ queryKey: ["depositDetails", id] });
      showSuccessNotification(
        "marketplace:notifications.update_success_title",
        "marketplace:notifications.update_success_message",
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
      errorTitle: "common:notifications.error",
      errorMessage: "admin:listings.notifications.fetch_deposit_codes_error",
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
      errorTitle: "common:notifications.error",
      errorMessage: "admin:listings.notifications.transfer_error",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-details", id_deposit] });
      queryClient.invalidateQueries({
        queryKey: ["depositDetails", id_deposit],
      });
      showSuccessNotification(
        "admin:listings.notifications.transfer_success_title",
        "admin:listings.notifications.transfer_success_message",
      );
    },
  });
};
