package models

import "time"

type ValidationResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   int    `json:"error"`
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
