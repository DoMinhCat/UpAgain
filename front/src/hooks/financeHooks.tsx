import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFinanceRevenue,
  getFinanceSettings,
  updateFinanceSetting,
  getInvoiceUsers,
  getUserInvoices,
  getFinanceSettingByKey,
} from "../api/financeModule";
import type {
  RevenueResponse,
  FinanceSetting,
  InvoicesListResponse,
  UserInvoicesResponse,
} from "../api/interfaces/finance";

const STALE_TIME = 60 * 1000;

export const useGetFinanceRevenue = (year: number) => {
  return useQuery<RevenueResponse>({
    queryKey: ["financeRevenue", year],
    queryFn: () => getFinanceRevenue(year),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:finance.notifications.error_loading_revenue",
      errorMessage: "admin:finance.notifications.error_loading_revenue",
    },
  });
};

export const useGetFinanceSettings = () => {
  return useQuery<FinanceSetting[]>({
    queryKey: ["financeSettings"],
    queryFn: getFinanceSettings,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:finance.notifications.error_loading_settings",
      errorMessage: "admin:finance.notifications.error_loading_settings",
    },
  });
};

export const useUpdateFinanceSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: number }) =>
      updateFinanceSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeSettings"] });
    },
  });
};

export const useGetInvoiceUsers = (
  page: number,
  limit: number,
  search: string,
  sort?: string,
) => {
  return useQuery<InvoicesListResponse>({
    queryKey: ["invoiceUsers", page, limit, search, sort],
    queryFn: () => getInvoiceUsers(page, limit, search, sort),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:finance.notifications.error_loading_users",
      errorMessage: "admin:finance.notifications.error_loading_users",
    },
  });
};

export const useGetUserInvoices = (userId: number, enabled: boolean) => {
  return useQuery<UserInvoicesResponse>({
    queryKey: ["userInvoices", userId],
    queryFn: () => getUserInvoices(userId),
    enabled,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:finance.notifications.error_loading_invoices",
      errorMessage: "admin:finance.notifications.error_loading_invoices",
    },
  });
};

export const useGetFinanceSettingByKey = (key: string) => {
  return useQuery<number>({
    queryKey: ["financeSetting", key],
    queryFn: () => getFinanceSettingByKey(key),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "admin:finance.notifications.error_loading_setting",
      errorMessage: "admin:finance.notifications.error_loading_setting",
    },
  });
};
