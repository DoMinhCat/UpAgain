// all hooks for account management

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  recoverAccount,
  getAccountDetails,
  deleteAccount,
  updatePassword,
  banAccount,
  getAllAccounts,
  RegisterRequest,
  type Account,
  type updateIsBannedPayload,
  type updatePasswordPayload,
  getAccountStats,
  type AccountStats,
  type updateAccountPayload,
  updateAccount,
} from "../api/admin/userModule";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../components/NotificationToast";

export const useRecoverAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => recoverAccount(accountId),
    onSuccess: (response, accountId) => {
      if (response?.status === 204) {
        queryClient.invalidateQueries({ queryKey: ["deletedAccounts"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({
          queryKey: ["accountDetails", accountId],
        });
        showSuccessNotification(
          "Account recovered",
          "Account recovered successfully.",
        );
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account recovery failed", error);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => deleteAccount(accountId),
    onSuccess: (response) => {
      if (response?.status === 204) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["deletedAccounts"] });
        showSuccessNotification(
          "Account deleted",
          "Account deleted successfully.",
        );
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account deletion failed", error);
    },
  });
};

export const useAccountDetails = (
  accountId: number,
  enabled: boolean = true,
) => {
  return useQuery<Account>({
    queryKey: ["accountDetails", accountId],
    queryFn: () => getAccountDetails(accountId),
    enabled,
  });
};

export const useGetAllAccounts = (isDeleted: boolean) => {
  return useQuery<Account[]>({
    queryKey: [isDeleted ? "deletedAccounts" : "accounts"],
    queryFn: () => getAllAccounts(isDeleted),
    staleTime: 1000 * 60 * 2, // refresh data every 2m
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (payload: updatePasswordPayload) => updatePassword(payload),
    onSuccess: (response) => {
      if (response?.status === 204) {
        showSuccessNotification(
          "Password updated",
          "Password changed successfully.",
        );
      }
    },
    onError: (error: any) => {
      showErrorNotification("Password update failed", error);
    },
  });
};

export const useToggleBanAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateIsBannedPayload) => banAccount(payload),
    onSuccess: (response, variables) => {
      if (response?.status === 204) {
        showSuccessNotification(
          variables.is_banned ? "Account banned" : "Account unbanned",
          variables.is_banned
            ? "This account has been banned."
            : "This account has been unbanned.",
        );
        queryClient.invalidateQueries({
          queryKey: ["accountDetails", variables.id],
        });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      }
    },
    onError: (error: any, variables) => {
      showErrorNotification(
        variables.is_banned
          ? "Account banning failed"
          : "Account unbanning failed",
        error,
      );
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RegisterRequest,
    onSuccess: (response) => {
      if (response?.status === 201) {
        showSuccessNotification(
          "Account creation success",
          "Account created successfully.",
        );
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account creation failed", error);
    },
  });
};

export const useAccountStats = (accountId: number, enabled: boolean = true) => {
  return useQuery<AccountStats>({
    queryKey: ["accountStats", accountId],
    queryFn: () => getAccountStats(accountId),
    enabled,
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateAccountPayload) => updateAccount(payload),
    onSuccess: (response, variables) => {
      if (response?.status === 204) {
        showSuccessNotification(
          "Account updated",
          "Account updated successfully.",
        );
        queryClient.invalidateQueries({
          queryKey: ["accountDetails", variables.id_account],
        });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account update failed", error);
    },
  });
};
