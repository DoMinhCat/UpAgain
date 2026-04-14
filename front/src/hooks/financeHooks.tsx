import { useQuery } from "@tanstack/react-query";
import {
  getFinanceRevenue,
  getInvoiceUsers,
  getUserInvoices,
} from "../api/financeModule";
import type {
  RevenueResponse,
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
