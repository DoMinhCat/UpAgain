package models

import "time"

type Container struct {
	ID         int       `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	CityName   string    `json:"city_name"`
	PostalCode string    `json:"postal_code"`
	Status     string    `json:"status"`
	IsDeleted  bool      `json:"is_deleted"`
	CurrentDepositId int `json:"current_deposit_id"`
	CurrentDepositTitle string `json:"current_deposit_title"`
}

type ContainerCountStats struct {
	Active int `json:"active"`
	Total  int `json:"total"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" example:"running"`
}

type UpdateLocationRequest struct {
	CityName string `json:"city_name"`
	// TODO: allow edit street
	Street string `json:"street"`
}

type ContainerFilters struct {
	Search string `json:"search"`
	Status string `json:"status"`
}

type ContainerListPagination struct {
	Containers   []Container `json:"containers"`
	CurrentPage  int         `json:"current_page"`
	LastPage     int         `json:"last_page"`
	Limit        int         `json:"limit"`
	TotalRecords int         `json:"total_records"`
}

type ContainerScheduleItem struct {
	DepositId         int       `json:"deposit_id"`
	DepositTitle      string    `json:"deposit_title"`
	ValidFrom  time.Time `json:"valid_from"`
	ValidTo    time.Time `json:"valid_to"`
}

type ContainerSchedule struct {
	UserRange []ContainerScheduleItem `json:"user_range"`
	ProRange []ContainerScheduleItem `json:"pro_range"`
}