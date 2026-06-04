package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"slices"
)

var notiSettingTypes = []string{
	"user_object_status",
	"user_validation_status",
	"user_object_retrieved",
	"user_event_updated",
	"user_code_expiring",
	"pro_material_available",
	"pro_object_deposited",
	"pro_object_expired",
	"pro_subscription_end",
	"pro_code_expiring",
	"emp_event_updated",
	"emp_event_assigned",
}

func GetNotiSettingsByAccountId(accountId int) ([]models.NotiSetting, error) {
	settings := make([]models.NotiSetting, 0)

	rows, err := utils.Conn.Query("SELECT noti_type, is_enabled FROM noti_settings WHERE id_account=$1", accountId)
	if err != nil {
		return nil, fmt.Errorf("GetNotiSettingsByAccountId() query failed: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var s models.NotiSetting
		if err := rows.Scan(&s.NotiType, &s.IsEnabled); err != nil {
			return nil, fmt.Errorf("GetNotiSettingsByAccountId() scan failed: %v", err)
		}
		settings = append(settings, s)
	}

	return settings, nil
}

func InsertDefaultNotiSetting(accountId int) error {
	for _, notiType := range notiSettingTypes {
		_, err := utils.Conn.Exec(`
		INSERT INTO noti_settings (id_account, noti_type, is_enabled)
		VALUES ($1, $2, $3)`,
			accountId, notiType, true)
		if err != nil {
			return fmt.Errorf("InsertNotiSetting() failed: %v", err)
		}
	}
	return nil
}

func UpdateNotiSetting(accountId int, notiType string, isEnabled bool) error {
	if !slices.Contains(notiSettingTypes, notiType) {
		return fmt.Errorf("UpdateNotiSetting() invalid noti_type: %s", notiType)
	}

	_, err := utils.Conn.Exec(`
		INSERT INTO noti_settings (id_account, noti_type, is_enabled)
		VALUES ($1, $2, $3)
		ON CONFLICT (id_account, noti_type)
		DO UPDATE SET is_enabled = EXCLUDED.is_enabled`,
		accountId, notiType, isEnabled)
	if err != nil {
		return fmt.Errorf("UpdateNotiSetting() failed: %v", err)
	}
	return nil
}
