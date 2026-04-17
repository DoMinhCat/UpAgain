package db

import (
	"backend/utils"
	"fmt"
)

func GetTotalSubscriptionSpendingsById(id_account int) (int, error) {
	var total int

	// Uses snapshot price stored in subscriptions table at purchase time
	query := `
	select COALESCE(sum(price), 0) from subscriptions
	where id_pro = $1 and is_trial=false;
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalSubscriptionSpendingsById() failed: %v", err.Error())
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
