import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  NotiSetting,
  UpdateNotiSettingPayload,
  NotificationDetail,
  MarkNotificationsReadPayload,
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

export const getNotifications = async (): Promise<NotificationDetail[]> => {
  const response = await api.get(ENDPOINTS.NOTIFICATIONS.ALL);
  return response.data;
};

export const markNotificationsAsRead = async (
  payload: MarkNotificationsReadPayload,
) => {
  return await api.patch(ENDPOINTS.NOTIFICATIONS.READ, payload);
};

export const deleteNotification = async (notiId: string) => {
  return await api.delete(ENDPOINTS.NOTIFICATIONS.DELETE(notiId));
};
