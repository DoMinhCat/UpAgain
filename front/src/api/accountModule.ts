import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import {
  type Account,
  type AccountsListPagination,
  type updatePasswordPayload,
  type updateIsBannedPayload,
  type AccountStats,
  type updateAccountPayload,
  type AccountCountStats,
  type RegisterPayload,
} from "./interfaces/account";

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
  const response = await api.get(ENDPOINTS.ADMIN.USERS.ALL, {
    params: { is_deleted, page, limit, search, role, status, sort },
  });
  return response.data;
};

export const RegisterRequest = async (payload: RegisterPayload) => {
  return await api.post(ENDPOINTS.AUTH.REGISTER, payload);
};

export const deleteAccount = async (id_account: number) => {
  return await api.delete(ENDPOINTS.ADMIN.USERS.ALL + id_account + "/");
};

export const getAccountDetails = async (
  id_account: number,
): Promise<Account> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.ALL + id_account + "/");
  return response.data;
};

export const updatePassword = async (payload: updatePasswordPayload) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS.UPDATE_PASSWORD(payload.id), {
    password: payload.newPassword,
  });
};

export const banAccount = async (payload: updateIsBannedPayload) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS.BAN(payload.id), {
    is_banned: payload.is_banned,
  });
};

export const recoverAccount = async (id_account: number) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS.RECOVER(id_account));
};

export const getAccountStats = async (
  id_account: number,
): Promise<AccountStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.STATS(id_account));
  return response.data;
};

export const updateAccount = async (payload: updateAccountPayload) => {
  return await api.patch(ENDPOINTS.ADMIN.USERS.UPDATE(payload.id_account), {
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
  });
};

export const getAccountCountStats = async (): Promise<AccountCountStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.COUNT);
  return response.data;
};
