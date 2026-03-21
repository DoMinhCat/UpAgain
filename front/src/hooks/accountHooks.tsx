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
  getAccountStats,
  updateAccount,
  getAccountCountStats,
} from "../api/admin/accountModule";
import {
  type Account,
  type updateIsBannedPayload,
  type updatePasswordPayload,
  type AccountStats,
  type updateAccountPayload,
  type AccountsListPagination,
  type AccountCountStats,
} from "../api/interfaces/account";
import { showSuccessNotification } from "../components/NotificationToast";

export const useRecoverAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => recoverAccount(accountId),
    meta: {
      errorTitle: "Account recovery failed",
      errorMessage: "Could not recover the account",
    },
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
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => deleteAccount(accountId),
    meta: {
      errorTitle: "Account deletion failed",
      errorMessage: "Could not delete the account",
    },
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
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load account details",
    },
  });
};

export const useGetAllAccounts = (
  isDeleted: boolean,
  page?: number,
  limit?: number,
  search?: string,
  role?: string,
  status?: string,
  sort?: string,
) => {
  return useQuery<AccountsListPagination>({
    queryKey: [
      isDeleted ? "deletedAccounts" : "accounts",
      page,
      limit,
      search,
      role,
      status,
      sort,
    ],
    queryFn: () =>
      getAllAccounts(isDeleted, page, limit, search, role, status, sort),
    staleTime: 1000 * 60,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load accounts list",
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (payload: updatePasswordPayload) => updatePassword(payload),
    meta: {
      errorTitle: "Password update failed",
      errorMessage: "Could not update the password",
    },
    onSuccess: (response) => {
      if (response?.status === 204) {
        showSuccessNotification(
          "Password updated",
          "Password changed successfully.",
        );
      }
    },
  });
};

export const useToggleBanAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateIsBannedPayload) => banAccount(payload),
    meta: {
      errorTitle: "Account status update failed",
      errorMessage: "Could not update the account ban status",
    },
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
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RegisterRequest,
    meta: {
      errorTitle: "Account creation failed",
      errorMessage: "Could not create the account",
    },
    onSuccess: (response) => {
      if (response?.status === 201) {
        showSuccessNotification(
          "Account creation success",
          "Account created successfully.",
        );
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      }
    },
  });
};

export const useAccountStats = (accountId: number, enabled: boolean = true) => {
  return useQuery<AccountStats>({
    queryKey: ["accountStats", accountId],
    queryFn: () => getAccountStats(accountId),
    enabled,
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load account stats",
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateAccountPayload) => updateAccount(payload),
    meta: {
      errorTitle: "Account update failed",
      errorMessage: "Could not update the account",
    },
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
  });
};

export const useAccountCountStats = () => {
  return useQuery<AccountCountStats>({
    queryKey: ["accountCountStats"],
    queryFn: getAccountCountStats,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load account count stats",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};
