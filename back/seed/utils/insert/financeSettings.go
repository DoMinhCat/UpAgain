package insert

import (
	"database/sql"
	"fmt"
)

// InsertFinanceSettings inserts the initial finance settings into the 'finance_settings' table.
// This includes 'trial_days', 'commission_rate', 'ads_price_per_month', and 'subscription_price'.
func InsertFinanceSettings(tx *sql.Tx) error {
	settings := []struct {
		Key   string
		Value float64
	}{
		{Key: "trial_days", Value: 14},
		{Key: "commission_rate", Value: 15},
		{Key: "ads_price_per_month", Value: 35},
		{Key: "subscription_price", Value: 10},
	}

	query := `
		INSERT INTO finance_settings (key, value)
		VALUES ($1, $2)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert finance settings statement: %w", err)
	}
	defer stmt.Close()

	for _, setting := range settings {
		_, err := stmt.Exec(setting.Key, setting.Value)
		if err != nil {
			return fmt.Errorf("failed to insert finance setting %s: %w", setting.Key, err)
		}
	}

	fmt.Println("Successfully seeded finance settings.")
	return nil
}
