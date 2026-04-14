package db

import (
	"backend/utils"
	"fmt"
	"slices"
)

func GetFinanceSettingByKey(key string) (float64, error) {
	var price float64
	allowed_keys := []string{"ads_price_per_month", "subscription_price", "trial_days", "commission_rate"}

	if !slices.Contains(allowed_keys, key) {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: invalid key '%v'", key)
	}

	row := utils.Conn.QueryRow("SELECT value FROM finance_settings WHERE key=$1", key)
	if err := row.Scan(&price); err != nil {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: %v", err.Error())
	}
	return price, nil
}

func UpdateFinanceSettingByKey(key string, value float64) error {
	allowed_keys := []string{"ads_price_per_month", "subscription_price", "trial_days", "commission_rate"}

	if !slices.Contains(allowed_keys, key) {
		return fmt.Errorf("UpdateFinanceSettingByKey() failed: invalid key '%v'", key)
	}

	_, err := utils.Conn.Exec("UPDATE finance_settings SET value = $1, updated_at = NOW() WHERE key = $2", value, key)
	return err
}
