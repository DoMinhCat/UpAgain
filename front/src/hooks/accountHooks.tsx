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
  updateAvatar,
} from "../api/accountModule";
import {
  type Account,
  type updateIsBannedPayload,
  type updatePasswordPayload,
  type AccountStats,
  type updateAccountPayload,
  type AccountsListPagination,
  type AccountCountStats,
} from "../api/interfaces/account";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useRecoverAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => recoverAccount(accountId),
    meta: {
      errorTitle: "admin:users.notifications.error_recovering",
      errorMessage: "admin:users.notifications.error_recovering",
    },
    onSuccess: (response, accountId) => {
      if (response?.status === 204) {
        queryClient.invalidateQueries({ queryKey: ["deletedAccounts"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["histories"] });
        queryClient.invalidateQueries({
          queryKey: ["accountDetails", accountId],
        });
        showSuccessNotification(
          "admin:users.notifications.recover_success_title",
          "admin:users.notifications.recover_success_message",
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
      errorTitle: "admin:users.notifications.error_deleting",
      errorMessage: "admin:users.notifications.error_deleting",
    },
    onSuccess: (response) => {
      if (response?.status === 204) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["histories"] });
        queryClient.invalidateQueries({ queryKey: ["deletedAccounts"] });
        showSuccessNotification(
          "admin:users.notifications.delete_success_title",
          "admin:users.notifications.delete_success_message",
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
      errorTitle: "admin:users.notifications.error_loading_details",
      errorMessage: "admin:users.notifications.error_loading_details",
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
      errorTitle: "admin:users.notifications.error_loading_accounts",
      errorMessage: "admin:users.notifications.error_loading_accounts",
    },
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updatePasswordPayload) => updatePassword(payload),
    meta: {
      errorTitle: "admin:users.notifications.error_updating_password",
      errorMessage: "admin:users.notifications.error_updating_password",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      showSuccessNotification(
        "admin:users.notifications.password_update_success_title",
        "admin:users.notifications.password_update_success_message",
      );
    },
  });
};

export const useToggleBanAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateIsBannedPayload) => banAccount(payload),
    meta: {
      errorTitle: "admin:users.notifications.error_updating_status",
      errorMessage: "admin:users.notifications.error_updating_status",
    },
    onSuccess: (response, variables) => {
      if (response?.status === 204) {
        showSuccessNotification(
          variables.is_banned
            ? "admin:users.notifications.ban_success_title"
            : "admin:users.notifications.unban_success_title",
          variables.is_banned
            ? "admin:users.notifications.ban_success_message"
            : "admin:users.notifications.unban_success_message",
        );
        queryClient.invalidateQueries({
          queryKey: ["accountDetails", variables.id],
        });
        queryClient.invalidateQueries({ queryKey: ["histories"] });
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
      errorTitle: "admin:users.notifications.error_creating",
      errorMessage: "admin:users.notifications.error_creating",
    },
    onSuccess: (response) => {
      if (response?.status === 201) {
        showSuccessNotification(
          "admin:users.notifications.create_success_title",
          "admin:users.notifications.create_success_message",
        );
        queryClient.invalidateQueries({ queryKey: ["histories"] });
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
      errorTitle: "admin:users.notifications.error_loading_stats",
      errorMessage: "admin:users.notifications.error_loading_stats",
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: updateAccountPayload) => updateAccount(payload),
    meta: {
      errorTitle: "admin:users.notifications.error_updating",
      errorMessage: "admin:users.notifications.error_updating",
    },
    onSuccess: (_, variables) => {
      showSuccessNotification(
        "admin:users.notifications.update_success_title",
        "admin:users.notifications.update_success_message",
      );
      queryClient.invalidateQueries({
        queryKey: ["accountDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useAccountCountStats = () => {
  return useQuery<AccountCountStats>({
    queryKey: ["accountCountStats"],
    queryFn: getAccountCountStats,
    meta: {
      errorTitle: "admin:users.notifications.error_loading_count_stats",
      errorMessage: "admin:users.notifications.error_loading_count_stats",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};

export const useUpdateAvatar = (account_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => updateAvatar(account_id, payload),
    meta: {
      errorTitle: "admin:users.notifications.error_updating_avatar",
      errorMessage: "admin:users.notifications.error_updating_avatar",
    },
    onSuccess: () => {
      showSuccessNotification(
        "admin:users.notifications.avatar_update_success_title",
        "admin:users.notifications.avatar_update_success_message",
      );
      queryClient.invalidateQueries({
        queryKey: ["accountDetails", account_id],
      });
    },
  });
};
