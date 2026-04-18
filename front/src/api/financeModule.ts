import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  RevenueResponse,
  FinanceSetting,
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

export const getFinanceSettings = async (): Promise<FinanceSetting[]> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.SETTINGS);
  return response.data;
};

export const updateFinanceSetting = async (
  key: string,
  value: number,
): Promise<void> => {
  await api.put(ENDPOINTS.ADMIN.FINANCE.UPDATE_SETTING(key), { value });
};

export const getInvoiceUsers = async (
  page: number,
  limit: number,
  search: string,
  sort?: string,
): Promise<InvoicesListResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.INVOICES, {
    params: { page, limit, search, ...(sort && { sort }) },
  });
  return response.data;
};

export const getUserInvoices = async (
  userId: number,
): Promise<UserInvoicesResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.USER_INVOICES(userId));
  return response.data;
};

export const getFinanceSettingByKey = async (key: string): Promise<number> => {
  const response = await api.get(ENDPOINTS.ADMIN.FINANCE.UPDATE_SETTING(key));
  return response.data;
};
