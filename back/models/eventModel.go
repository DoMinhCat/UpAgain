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
	Description    string    `json:"description"`
	StartAt        null.Time `json:"start_at"`
	EndAt          null.Time `json:"end_at"`
	Price          null.Float   `json:"price" swaggertype:"number"`
	Category       string    `json:"category"`
	Capacity       null.Int       `json:"capacity" swaggertype:"integer"`
	Status         string    `json:"status"`
	City           string    `json:"city"`
	Street         string    `json:"street"`
	LocationDetail null.String    `json:"location_detail" swaggertype:"string"`
	EmployeeName   null.String `json:"employee_name" swaggertype:"string"`
}

type EventsListPagination struct {
	Events       []Event `json:"events"`
	CurrentPage  int     `json:"current_page"`
	LastPage     int     `json:"last_page"`
	Limit        int     `json:"limit"`
	TotalRecords int     `json:"total_records"`
}

type CreateEventRequest struct {
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	StartAt        null.Time `json:"start_at"`
	EndAt          null.Time `json:"end_at"`
	Price          null.Float   `json:"price" swaggertype:"number"`
	Category       string    `json:"category"`
	Capacity       null.Int       `json:"capacity" swaggertype:"integer"`
	Status         string    `json:"status"`
	City           string    `json:"city"`
	Street         string    `json:"street"`
	LocationDetail null.String    `json:"location_detail" swaggertype:"string"`
}

type AssignEmployeeRequest struct{
	IdsEmployee []int `json:"ids_employee"`
	StartAt time.Time `json:"start_at"`
	EndAt time.Time `json:"end_at"`
}

type UnAssignEmployeeRequest struct{
	IdEmployee int `json:"id_employee"`
}

type UpdateEventStatusRequest struct{
	Status string `json:"status"`
}