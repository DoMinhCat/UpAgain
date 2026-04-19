package db

import (
	"backend/models"
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
		total += int(ads_price/30) * int(end_date.Sub(start_date).Hours()/24)
	}
	return total, nil
}

// count ads of an account having ads status pending/active
func GetTotalActiveAdsById(id_account int) (int, error) {
	var total int

	query := `
		select count(*) from ads a
		join posts p on a.id_post=p.id
		join accounts ac on ac.id=p.id_account		
		where ac.id=$1 and (a.status='pending' or a.status='active')
	`
	err := utils.Conn.QueryRow(query+";", id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveAdsById	() failed: %v", err)
	}

	return total, nil
}

func CreateAds(payload models.CreateAdsRequest, role string) (int, error) {
	if role != "admin" && role != "pro" {
		return 0, fmt.Errorf("CreateAds() failed: role must be 'pro' or 'admin'")
	}

	endDate := payload.From.AddDate(0, payload.Duration, 0)
	idAds := 0

	if role == "admin" {
		// insert without price
		query := `
			insert into ads (id_post, start_date, end_date, price_per_month, total_price)
			values ($1, $2, $3, 0, 0)
			returning id
		`
		err := utils.Conn.QueryRow(query, payload.IdPost, payload.From, endDate).Scan(&idAds)
		if err != nil {
			return 0, fmt.Errorf("CreateAds() failed: %v", err.Error())
		}
	} else {
		// TODO: get current price of ads, calculate total price and insert into db
	}

	return idAds, nil
}