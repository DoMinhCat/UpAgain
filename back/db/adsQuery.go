package db

import (
	"backend/utils"
	"fmt"
	"time"
)

func GetTotalAdsSpendingsById(id int) (int, error) {
	total := 0
	var start_date time.Time
	var end_date time.Time

	ads_price, err := GetFinanceSettingByKey("ads_price_per_month")
	if err != nil {
		return 0, fmt.Errorf("GetTotalAdsSpendingsById() failed: %v", err.Error())
	}

	query := `
	select start_date, end_date from ads a
	join posts p on a.id_post = p.id
	where p.id_account = $1
	`
	rows, err := utils.Conn.Query(query, id)
	if err != nil {
		return 0, fmt.Errorf("GetTotalAdsSpendingsById() failed: %v", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		if err := rows.Scan(&start_date, &end_date); err != nil {
			return 0, fmt.Errorf("GetTotalAdsSpendingsById() failed: %v", err.Error())
		}
		// price is monthly, so we divide by 30 to get price of 1 day
		total += (ads_price / 30) * int(end_date.Sub(start_date).Hours() / 24)
	}
	return total, nil
}