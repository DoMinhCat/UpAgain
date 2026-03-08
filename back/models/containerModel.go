package models

import "time"

type Container struct {
	ID         int       `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	CityName   string    `json:"city_name"`
	PostalCode string    `json:"postal_code"`
	Status     string    `json:"status"`
	IsDeleted  bool      `json:"is_deleted"`
}
