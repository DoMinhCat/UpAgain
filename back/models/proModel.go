package models

import (
	"github.com/guregu/null"
)

type ProDetails struct {
	Phone     null.String `json:"phone" swaggertype:"string"`
	IsPremium bool        `json:"is_premium"`
}

type ProStats struct {
	TotalDeposits int     `json:"total_deposits"`
	TotalListings int     `json:"total_listings"`
	TotalProjects int     `json:"total_projects"`
	TotalSpent    float64 `json:"total_spendings"`
}

type MaterialInventoryStats struct {
	Material  string `json:"material"`
	Available int    `json:"available"`
	Added     int    `json:"added"`
	Recycled  int    `json:"recycled"`
}

type MaterialUsageStats struct {
	Material string  `json:"material"`
	Weight   float64 `json:"weight"`
}

type ProAnalyticsResponse struct {
	Inventory []MaterialInventoryStats `json:"inventory"`
	Impact    struct {
		TotalCO2      float64              `json:"total_co2"`
		MaterialUsage []MaterialUsageStats `json:"material_usage"`
	} `json:"impact"`
	Finance struct {
		TotalPurchases int     `json:"total_purchases"`
		PaidPurchases  int     `json:"paid_purchases"`
		TotalSpent     float64 `json:"total_spent"`
	} `json:"finance"`
}

type UpdateProAlertMaterialsRequest struct {
	Materials []string `json:"materials"`
}
