package models

import "github.com/guregu/null"

type UserDetails struct {
	Phone            null.String `json:"phone" swaggertype:"string"`
	Score            int         `json:"score"`
	CompletedOnboard bool        `json:"completed_onboard"`
}

type UserStats struct {
	TotalDeposits int     `json:"total_deposits"`
	TotalListings int     `json:"total_listings"`
	TotalSpent    float64 `json:"total_spendings"`
}

type TotalScoreStats struct {
	Total int     `json:"total"`
	CO2   float64 `json:"co2"`
}

type UserImpactStats struct {
	CO2         float64 `json:"co2"`
	Water       float64 `json:"water"`
	Electricity float64 `json:"electricity"`
}

type UserImpactItem struct {
	Id          int      `json:"id"`
	Title       string   `json:"title"`
	Material    string   `json:"material"`
	Weight      float64  `json:"weight"`
	Price       float64  `json:"price"`
	Photos      []string `json:"images"`
	SoldDate    string   `json:"sold_date"`
	BuyerName   string   `json:"buyer_name"`
	CO2         float64  `json:"co2"`
	Water       float64  `json:"water"`
	Electricity float64  `json:"electricity"`
}

type UserImpactItemsPagination struct {
	Items        []UserImpactItem `json:"items"`
	CurrentPage  int              `json:"current_page"`
	LastPage     int              `json:"last_page"`
	Limit        int              `json:"limit"`
	TotalRecords int              `json:"total_records"`
}
