package models

import "github.com/guregu/null"

type ProDetails struct {
	Phone     null.String `json:"phone" swaggertype:"string"`
	IsPremium bool        `json:"is_premium"`
}

type ProStats struct {
	TotalDeposits int `json:"total_deposits"`
	TotalListings int `json:"total_listings"`
	TotalProjects int `json:"total_projects"`
	TotalSpent    int `json:"total_spendings"`
}
