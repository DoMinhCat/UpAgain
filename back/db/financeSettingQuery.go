package db

import (
	"backend/utils"
	"fmt"
	"slices"
)

func GetFinanceSettingByKey(key string) (int, error) {
	var price int
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
