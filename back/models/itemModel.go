package models

import "time"

type ItemFilters struct {
	Search   string `json:"search"`
	Sort     string `json:"sort"`
	Category string `json:"category"`
	Status   string `json:"status"`
	Material string `json:"material"`
}

type Item struct {
	CreatedAt time.Time 	`json:"created_at"`
	Id        	int       	`json:"id"`
	Title     	string    	`json:"title"`
	Description string  	`json:"description"`
    Weight      float64 	`json:"weight"`
    State       string 		`json:"state"`
    IdUser 		int   		`json:"id_user"`
	Username   	string    	`json:"username"`
	Category  	string    	`json:"category"`  // listing or deposit
	Material  	string    	`json:"material"`
	Price     	float64   	`json:"price"`
	Status    	string    	`json:"status"`
}

type ItemListPagination struct {
	Items        []Item `json:"items"`
	CurrentPage  int    `json:"current_page"`
	LastPage     int    `json:"last_page"`
	Limit        int    `json:"limit"`
	TotalRecords int    `json:"total_records"`
}

type ItemAdminStats struct {
	NewItemsSince 			int `json:"new_since"`
	ActiveItems 			int `json:"active"`
	PendingItems 			int `json:"pending"`
	NewTransactionsSince 	int `json:"new_transactions_since"`
	TotalTransactions 		int `json:"total_transactions"`
	// chart
	TotalListings 			int `json:"total_listings"`
	TotalDeposits 			int `json:"total_deposits"`
	TotalWood 				int `json:"total_wood"`
	TotalMetal 				int `json:"total_metal"`
	TotalPlastic 			int `json:"total_plastic"`
	TotalGlass 				int `json:"total_glass"`
	TotalTextile 			int `json:"total_textile"`
	TotalMixed 				int `json:"total_mixed"`
	TotalOther 				int `json:"total_other"`
}
