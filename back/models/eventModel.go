package models

import (
	"time"

	"github.com/guregu/null"
)

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
	Id             int       `json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	Title          string    `json:"title"`
	Description    null.String    `json:"description"`
	StartAt        null.Time `json:"start_at"`
	Price          null.Float   `json:"price"`
	Category       string    `json:"category"`
	Capacity       null.Int       `json:"capacity"`
	Status         string    `json:"status"`
	City           string    `json:"city"`
	Street         string    `json:"street"`
	LocationDetail null.String    `json:"location_detail"`
	EmployeeName   null.String `json:"employee_name"`
}

type EventsListPagination struct {
	Events       []Event `json:"events"`
	CurrentPage  int     `json:"current_page"`
	LastPage     int     `json:"last_page"`
	Limit        int     `json:"limit"`
	TotalRecords int     `json:"total_records"`
}
