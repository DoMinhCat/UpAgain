import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  NotiSetting,
  UpdateNotiSettingPayload,
} from "./interfaces/notification";

export const getNotiSettings = async (
  id_account: number,
): Promise<NotiSetting[]> => {
  const response = await api.get(ENDPOINTS.ACCOUNTS.NOTIFICATIONS(id_account));
  return response.data;
};

export const updateNotiSetting = async (
  id_account: number,
  payload: UpdateNotiSettingPayload,
) => {
  return await api.patch(ENDPOINTS.ACCOUNTS.NOTIFICATIONS(id_account), payload);
};
