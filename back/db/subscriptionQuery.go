package db

import (
	"backend/utils"
	"fmt"
	"time"
)

func GetTotalSubscriptionSpendingsById(id_account int) (int, error) {
	var total int
	var sub_from time.Time
	var sub_to time.Time

	// get subscription price
	subscription_price, err := GetFinanceSettingByKey("subscription_price")
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
	}

	query := `
	select sub_from, sub_to from subscriptions where id_pro = $1
	and is_trial=false;
	`
	rows, err := utils.Conn.Query(query, id_account)
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		if err := rows.Scan(&sub_from, &sub_to); err != nil {
			return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
		}
		// price is monthly, so we divide by 30 to get price of 1 day
		total += (subscription_price / 30) * int(sub_to.Sub(sub_from).Hours()/24)
	}
	return total, nil
}

func GetTotalActiveSubscriptionById(id_account int) (int, error) {
	var total int
	query := `
		select count(*) from subscriptions
		where id_pro = $1 and is_trial=false and is_active=true;
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveSubscriptionById() failed: %v", err.Error())
	}
	return total, nil
}
