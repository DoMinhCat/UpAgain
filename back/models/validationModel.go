package models

import (
	"time"

	"github.com/guregu/null"
)

type ValidationResponse struct {
	Success bool  `json:"success"`
	Message error `json:"message"`
	Error   int   `json:"error"`
}

type PendingDepositResponse struct {
	ItemID      int       `json:"id_item"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Material    string    `json:"material"`
	State       string    `json:"state"`
	Weight      float64   `json:"weight"`
	CreatedAt   time.Time `json:"created_at"`
	ContainerID int       `json:"id_container"`
	CityName    string    `json:"city_name"`
	PostalCode  string    `json:"postal_code"`
	UserID      int       `json:"id_user"`
	Username    string    `json:"username"`
}

type PendingListingResponse struct {
	ItemID      int        `json:"id_item"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Material    string     `json:"material"`
	State       string     `json:"state"`
	Weight      float64    `json:"weight"`
	Price       null.Float `json:"price"`
	CreatedAt   time.Time  `json:"created_at"`
	CityName    string     `json:"city_name"`
	PostalCode  string     `json:"postal_code"`
	UserID      int        `json:"id_user"`
	Username    string     `json:"username"`
}

type PendingEventResponse struct {
	EventID          int         `json:"id_event"`
	Title            string      `json:"title"`
	Description      null.String `json:"description"`
	Category         string      `json:"category"`
	DateStart        time.Time   `json:"date_start"`
	Capacity         null.Int    `json:"capacity"`
	Price            null.Float  `json:"price"`
	CreatedAt        time.Time   `json:"created_at"`
	EmployeeID       int         `json:"id_employee"`
	EmployeeUsername string      `json:"employee_username"`
}

type ValidationActionRequest struct {
	Action string `json:"action"`
	Reason string `json:"reason"`
}
