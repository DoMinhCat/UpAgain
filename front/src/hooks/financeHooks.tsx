import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFinanceRevenue,
  getFinanceSettings,
  updateFinanceSetting,
  getInvoiceUsers,
  getUserInvoices,
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
      errorTitle: "Error",
      errorMessage: "Failed to fetch revenue data.",
    },
  });
};

export const useGetFinanceSettings = () => {
  return useQuery<FinanceSetting[]>({
    queryKey: ["financeSettings"],
    queryFn: getFinanceSettings,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch finance settings.",
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
) => {
  return useQuery<InvoicesListResponse>({
    queryKey: ["invoiceUsers", page, limit, search],
    queryFn: () => getInvoiceUsers(page, limit, search),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch users.",
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
      errorTitle: "Error",
      errorMessage: "Failed to fetch user's invoices.",
    },
  });
};
