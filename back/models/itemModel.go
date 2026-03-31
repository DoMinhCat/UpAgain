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
	CreatedAt time.Time `json:"created_at"`
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Creator   string    `json:"creator"`
	Category  string    `json:"category"`  // listing or deposit
	Material  string    `json:"material"`
	Price     float64   `json:"price"`
	Status    string    `json:"status"`
}

type ItemListPagination struct {
	Items        []Item `json:"items"`
	CurrentPage  int    `json:"current_page"`
	LastPage     int    `json:"last_page"`
	Limit        int    `json:"limit"`
	TotalRecords int    `json:"total_records"`
}