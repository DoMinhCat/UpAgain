package models

type NotiSetting struct {
	NotiType  string `json:"noti_type"`
	IsEnabled bool   `json:"is_enabled"`
}

type UpdateNotiSettingRequest struct {
	NotiType  string `json:"noti_type"`
	IsEnabled bool   `json:"is_enabled"`
}
