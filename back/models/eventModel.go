package models

import "time"

type EventStats struct {
	Total            int `json:"total"`
	NewEvents        int `json:"increase"`
	UpcomingEvents   int `json:"upcoming"`
	Registrations    int `json:"registrations"`
	PendingApprovals int `json:"pending"`
}

type EventFilters struct {
	Search string
	Sort   string
	Status string
}

type Event struct {
	Id               int       `json:"id"`
	CreatedAt        time.Time `json:"created_at"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	StartAt        time.Time `json:"start_at"`
	Price            float64   `json:"price"`
	Category            string   `json:"category"`
	Capacity     int       `json:"capacity"`
	Status           string    `json:"status"`
	City         string    `json:"city"`
	Street       string    `json:"street"`
	LocationDetail string    `json:"location_detail"`
}

type EventsListPagination struct{
	Events []Event 	`json:"events"`
	CurrentPage int 	`json:"current_page"`
	LastPage int 	`json:"last_page"`
	Limit int 	`json:"limit"`
	TotalRecords int 	`json:"total_records"`
}