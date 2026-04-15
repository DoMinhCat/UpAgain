package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"slices"
)

var allowedFinanceKeys = []string{"ads_price_per_month", "subscription_price", "trial_days", "commission_rate"}

func GetFinanceSettingByKey(key string) (int, error) {
	var price int

	if !slices.Contains(allowedFinanceKeys, key) {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: invalid key '%v'", key)
	}

	row := utils.Conn.QueryRow("SELECT value FROM finance_settings WHERE key=$1", key)
	if err := row.Scan(&price); err != nil {
		return 0, fmt.Errorf("GetFinanceSettingByKey() failed: %v", err.Error())
	}
	return price, nil
}

// GetAllFinanceSettings returns all finance settings.
func GetAllFinanceSettings() ([]models.FinanceSetting, error) {
	rows, err := utils.Conn.Query("SELECT key::text, value, updated_at FROM finance_settings ORDER BY key")
	if err != nil {
		return nil, fmt.Errorf("error getting finance settings from DB: %v", err)
	}
	defer rows.Close()

	var settings []models.FinanceSetting
	for rows.Next() {
		var s models.FinanceSetting
		if err := rows.Scan(&s.Key, &s.Value, &s.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning finance setting row from DB: %v", err)
		}
		settings = append(settings, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating finance settings rows from DB: %v", err)
	}
	return settings, nil
}

// UpdateFinanceSetting updates the value of a finance setting and returns the old value.
func UpdateFinanceSetting(key string, value float64) (float64, error) {
	if !slices.Contains(allowedFinanceKeys, key) {
		return 0, fmt.Errorf("invalid key '%v'", key)
	}

	var oldValue float64
	err := utils.Conn.QueryRow("SELECT value FROM finance_settings WHERE key = $1", key).Scan(&oldValue)
	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("setting not found")
	}
	if err != nil {
		return 0, fmt.Errorf("error getting old finance setting from DB: %v", err)
	}

	_, err = utils.Conn.Exec(
		"UPDATE finance_settings SET value = $1, updated_at = now() WHERE key = $2",
		value, key,
	)
	if err != nil {
		return 0, fmt.Errorf("error updating finance setting in DB: %v", err)
	}

	return oldValue, nil
}
