package models

import "time"

// --- Revenue ---

type RevenueMonthData struct {
	Month         string  `json:"month"` // format "YYYY-MM"
	Subscriptions float64 `json:"subscriptions"`
	Commissions   float64 `json:"commissions"`
	Ads           float64 `json:"ads"`
	Events        float64 `json:"events"`
}

type RevenueSummary struct {
	TotalSubscriptions float64 `json:"total_subscriptions"`
	TotalCommissions   float64 `json:"total_commissions"`
	TotalAds           float64 `json:"total_ads"`
	TotalEvents        float64 `json:"total_events"`
	GrandTotal         float64 `json:"grand_total"`
}

type RevenueResponse struct {
	Year    int                `json:"year"`
	Data    []RevenueMonthData `json:"data"`
	Summary RevenueSummary     `json:"summary"`
}

// --- Invoices ---

type InvoiceUser struct {
	IDAccount        int       `json:"id_account"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	Role             string    `json:"role"`
	CreatedAt        time.Time `json:"created_at"`
	TransactionCount int       `json:"transaction_count"`
	TotalSpent       float64   `json:"total_spent"`
}

type InvoicesListResponse struct {
	Users []InvoiceUser `json:"users"`
	Total int           `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

type UserInvoice struct {
	ID            int       `json:"id"`
	CreatedAt     time.Time `json:"created_at"`
	Action        string    `json:"action"`
	ItemTitle     string    `json:"item_title"`
	ItemPrice     float64   `json:"item_price"`
	Amount        float64   `json:"amount"` // after commission or full price
	IDTransaction string    `json:"id_transaction"`
}

type UserInvoicesResponse struct {
	IDAccount int           `json:"id_account"`
	Username  string        `json:"username"`
	Email     string        `json:"email"`
	Invoices  []UserInvoice `json:"invoices"`
	Total     int           `json:"total"`
}
