package models

import "github.com/guregu/null"

type UserDetails struct {
	Phone null.String `json:"phone" swaggertype:"string"`
	Score int         `json:"score"`
}

type UserStats struct {
	TotalDeposits int `json:"total_deposits"`
	TotalListings int `json:"total_listings"`
	TotalSpent    int `json:"total_spendings"`
}

type TotalScoreStats struct {
	Total int     `json:"total"`
	CO2   float64 `json:"co2"`
}
