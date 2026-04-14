import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  RevenueResponse,
  InvoicesListResponse,
  UserInvoicesResponse,
} from "./interfaces/finance";

export const getFinanceRevenue = async (
  year?: number,
): Promise<RevenueResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.REVENUE, {
    params: year ? { year } : {},
  });
  return response.data;
};

export const getInvoiceUsers = async (
  page: number,
  limit: number,
  search: string,
): Promise<InvoicesListResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.INVOICES, {
    params: { page, limit, search },
  });
  return response.data;
};

export const getUserInvoices = async (
  userId: number,
): Promise<UserInvoicesResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.USER_INVOICES(userId));
  return response.data;
};
