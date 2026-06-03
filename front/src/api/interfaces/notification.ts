export interface NotiSetting {
  noti_type: string;
  is_enabled: boolean;
}

export interface UpdateNotiSettingPayload {
  noti_type: string;
  is_enabled: boolean;
}

export interface NotificationDetail {
  uuid: string;
  created_at: string;
  read_at: string | null;
  deleted_at: string | null;
  type: string;
  entity_type: string;
  entity_id: number;
  id_account: number;
  entity_title: string;
}

export interface MarkNotificationsReadPayload {
  ids: string[];
}
