package models

import (
	"time"

	"github.com/guregu/null"
)

type CreateAccountRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
	Phone    string `json:"phone"`
}

type Account struct {
	Id        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Role       string      `json:"role"`
	IsBanned   bool        `json:"is_banned"`
	CreatedAt  time.Time   `json:"created_at"`
	LastActive null.Time `json:"last_active"`
}

type AccountDetails struct {
	Id        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	IsBanned  bool      `json:"is_banned"`
	CreatedAt time.Time `json:"created_at"`
	LastActive null.Time `json:"last_active"`
	Phone     null.String    `json:"phone"`
	Score     int       `json:"score"`
	IsPremium bool    `json:"is_premium"`
	Avatar null.String `json:"avatar"`
}

