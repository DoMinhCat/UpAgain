package models

import (
	"time"

	"github.com/guregu/null"
)

type ItemFilters struct {
	Search   string `json:"search"`
	Sort     string `json:"sort"`
	Category string `json:"category"`
	Status           string `json:"status"`
	Material         string `json:"material"`
	IncludePurchased string `json:"include_purchased"`
}

type Item struct {
	CreatedAt       time.Time `json:"created_at"`
	Id              int       `json:"id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Weight          float64   `json:"weight"`
	State           string    `json:"state"`
	IdUser          int       `json:"id_user"`
	Username        string    `json:"username"`
	CreatorAvatar   null.String `json:"creator_avatar" swaggertype:"string"`
	Category        string    `json:"category"` // listing or deposit
	Material        string    `json:"material"`
	Price           float64   `json:"price"`
	Status          string    `json:"status"`
	RefuseReason    null.String `json:"refuse_reason" swaggertype:"string"`
	Photos          []string  `json:"images"`
	Street          string    `json:"street"`
	Score           int       `json:"score"`
}

type ItemCreateRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Price       float64   `json:"price"`
	Weight      float64  `json:"weight"`
	Material    string   `json:"material"`
	State       string   `json:"state"`
	Category    string   `json:"category"` // listing or deposit
	Photos      []string  `json:"images"`
	IdUser      int      `json:"id_user"`
	ListingInfo CreateListingRequest `json:"listing_info"`
	DepositInfo CreateDepositRequest `json:"deposit_info"`
}

type ItemListPagination struct {
	Items        []Item `json:"items"`
	CurrentPage  int    `json:"current_page"`
	LastPage     int    `json:"last_page"`
	Limit        int    `json:"limit"`
	TotalRecords int    `json:"total_records"`
}

type ItemAdminStats struct {
	NewItemsSince        int `json:"new_since"`
	ActiveItems          int `json:"active"`
	PendingItems         int `json:"pending"`
	NewTransactionsSince int `json:"new_transactions_since"`
	TotalTransactions    int `json:"total_transactions"`
	// chart
	TotalListings int `json:"total_listings"`
	TotalDeposits int `json:"total_deposits"`
	TotalWood     int `json:"total_wood"`
	TotalMetal    int `json:"total_metal"`
	TotalPlastic  int `json:"total_plastic"`
	TotalGlass    int `json:"total_glass"`
	TotalTextile  int `json:"total_textile"`
	TotalMixed    int `json:"total_mixed"`
	TotalOther    int `json:"total_other"`
}

type ItemStatusUpdateRequest struct {
	Status string `json:"status"`
}
