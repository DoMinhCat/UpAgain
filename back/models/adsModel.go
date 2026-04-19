package models

import "time"

type CreateAdsRequest struct {
	From     time.Time `json:"from"`
	Duration int       `json:"duration"`
	IdPost   int       `json:"id_post"`
}

type UpdateAdsRequest struct {
	IdAds    int       `json:"id_ads"`
	From     time.Time `json:"from"`
	To       time.Time `json:"to"`
}

type Ads struct {
	IdAds       int       `json:"id_ads"`
	IdPost      int       `json:"id_post"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	PricePerMonth float64   `json:"price_per_month"`
	TotalPrice    float64   `json:"total_price"`
	Status      string    `json:"status"`
}