import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";

export interface Account {
  id: number;
  username: string;
  email: string;
  role: string;
  is_banned: boolean;
  created_at: string;
  last_active: string;
  phone?: string;
  score?: number;
  is_premium?: boolean;
  avatar?: string;
  deleted_at?: string;
}

export interface AccountsListPagination {
  accounts: Account[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

// get active or deleted accounts
export const getAllAccounts = async (
  is_deleted: boolean,
  page?: number,
  limit?: number,
  search?: string,
  role?: string,
  status?: string,
  sort?: string,
): Promise<AccountsListPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS, {
    params: { is_deleted, page, limit, search, role, status, sort },
  });
  return response.data;
};
export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  phone?: string;
  role: string;
}

export const RegisterRequest = async (payload: RegisterPayload) => {
  return await api.post(ENDPOINTS.AUTH.REGISTER, payload);
};

export const deleteAccount = async (id_account: number) => {
  return await api.delete(ENDPOINTS.ADMIN.USERS + id_account + "/");
};

export const getAccountDetails = async (
  id_account: number,
): Promise<Account> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS + id_account + "/");
  return response.data;
};

export interface updatePasswordPayload {
  id: number;
  newPassword: string;
}
export const updatePassword = async (payload: updatePasswordPayload) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS + payload.id + "/password/", {
    password: payload.newPassword,
  });
};

export interface updateIsBannedPayload {
  id: number;
  is_banned: boolean;
}
export const banAccount = async (payload: updateIsBannedPayload) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS + payload.id + "/ban/", {
    is_banned: payload.is_banned,
  });
};

export const recoverAccount = async (id_account: number) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS + id_account + "/recover/");
};

export interface AccountStats {
  total_events?: number;
  total_posts?: number;
  total_deposits?: number;
  total_projects?: number;
  total_listings?: number;
  total_spendings?: number;
}

export const getAccountStats = async (
  id_account: number,
): Promise<AccountStats> => {
  const response = await api.get(
    ENDPOINTS.ADMIN.USERS + id_account + "/stats/",
  );
  return response.data;
};

export interface updateAccountPayload {
  id_account: number;
  username: string;
  email: string;
  phone?: string;
}
export const updateAccount = async (payload: updateAccountPayload) => {
  return await api.patch(
    ENDPOINTS.ADMIN.USERS + payload.id_account + "/update/",
    {
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
    },
  );
};

export interface AccountCountStats {
  total: number;
  increase: number;
}
export const getAccountCountStats = async (): Promise<AccountCountStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS_COUNT);
  return response.data;
};
