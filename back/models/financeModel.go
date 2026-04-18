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

// --- Finance Settings ---

type FinanceSetting struct {
	Key       string    `json:"key"`
	Value     float64   `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UpdateFinanceSettingRequest struct {
	Value float64 `json:"value"`
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

// UserInvoice represents a single spending entry for a user.
// The Type field determines which optional fields are populated:
// - "transaction": IDTransaction, ItemTitle, ItemPrice, Commission
// - "subscription": SubFrom, SubTo
// - "ad": AdStartDate, AdEndDate, PostID, PostTitle
// - "event": EventID, EventTitle
type UserInvoice struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Type      string    `json:"type"`   // "transaction", "subscription", "ad", "event"
	Amount    float64   `json:"amount"` // total paid

	// Transaction-specific
	IDTransaction *string  `json:"id_transaction,omitempty"`
	ItemTitle     *string  `json:"item_title,omitempty"`
	ItemPrice     *float64 `json:"item_price,omitempty"`
	Commission    *float64 `json:"commission,omitempty"`

	// Subscription-specific
	SubFrom *time.Time `json:"sub_from,omitempty"`
	SubTo   *time.Time `json:"sub_to,omitempty"`

	// Ad-specific
	AdStartDate *time.Time `json:"ad_start_date,omitempty"`
	AdEndDate   *time.Time `json:"ad_end_date,omitempty"`
	PostID      *int       `json:"post_id,omitempty"`
	PostTitle   *string    `json:"post_title,omitempty"`

	// Event-specific
	EventID    *int    `json:"event_id,omitempty"`
	EventTitle *string `json:"event_title,omitempty"`
}

type UserInvoicesResponse struct {
	IDAccount int           `json:"id_account"`
	Username  string        `json:"username"`
	Email     string        `json:"email"`
	Invoices  []UserInvoice `json:"invoices"`
	Total     int           `json:"total"`
}
