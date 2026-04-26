package models

import (
	"time"

	"github.com/guregu/null"
)

type CreateAccountRequest struct {
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Role      string `json:"role"`
	Phone     string `json:"phone"`
	IsTrial   *bool  `json:"is_trial,omitempty"`
	IsPremium *bool  `json:"is_premium,omitempty"`
}

type Account struct {
	Id         int         `json:"id"`
	Email      string      `json:"email"`
	Username   string      `json:"username"`
	Role       string      `json:"role"`
	IsBanned   bool        `json:"is_banned"`
	CreatedAt  time.Time   `json:"created_at"`
	LastActive null.Time   `json:"last_active"`
	DeletedAt  null.Time   `json:"deleted_at"`
	Avatar     null.String `json:"avatar" swaggertype:"string"`
}

type AccountsListPagination struct {
	Accounts     []Account `json:"accounts"`
	CurrentPage  int       `json:"current_page"`
	LastPage     int       `json:"last_page"`
	Limit        int       `json:"limit"`
	TotalRecords int       `json:"total_records"`
}

type AccountDetails struct {
	Id         int         `json:"id"`
	Email      string      `json:"email"`
	Username   string      `json:"username"`
	Role       string      `json:"role"`
	IsBanned   bool        `json:"is_banned"`
	CreatedAt  time.Time   `json:"created_at"`
	LastActive null.Time   `json:"last_active"`
	Phone      null.String `json:"phone" swaggertype:"string"`
	Score      int         `json:"score"`
	IsPremium  bool        `json:"is_premium"`
	Avatar     null.String `json:"avatar" swaggertype:"string"`
	DeletedAt  null.Time   `json:"deleted_at"`
}

type UpdatePasswordRequest struct {
	Password string `json:"password"`
}

type ToggleBanRequest struct {
	CurrentlyBanned bool `json:"is_banned"`
}

type UpdateAccountRequest struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type AccountCountStats struct {
	Total    int `json:"total"`
	Increase int `json:"increase"`
}

type AccountFilters struct {
	Search string
	Sort   string
	Role   string
	Status string
}
