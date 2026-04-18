package validations

import "fmt"

// ValidateFinanceSetting enforces business rules for each setting key.
func ValidateFinanceSetting(key string, value float64) error {
	switch key {
	case "trial_days":
		if value < 1 || value != float64(int(value)) {
			return fmt.Errorf("trial_days must be a whole number greater than or equal to 1")
		}
	case "commission_rate":
		if value < 0 || value > 100 {
			return fmt.Errorf("commission_rate must be between 0 and 100")
		}
	case "subscription_price":
		if value < 0 {
			return fmt.Errorf("subscription_price must be 0 or greater")
		}
	case "ads_price_per_month":
		if value < 0 {
			return fmt.Errorf("ads_price_per_month must be 0 or greater")
		}
	default:
		return fmt.Errorf("unknown setting key: %s", key)
	}
	return nil
}