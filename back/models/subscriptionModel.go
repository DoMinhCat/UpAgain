package models

import "time"

type Subscription struct {
	ID           int       `json:"id"`
	IsTrial      bool      `json:"is_trial"`
	IsActive     bool      `json:"is_active"`
	SubFrom      time.Time `json:"sub_from"`
	SubTo        time.Time `json:"sub_to"`
	IdPro        int       `json:"id_pro"`
	CancelReason *string   `json:"cancel_reason,omitempty"`
}

type SubscriptionWithUser struct {
	Subscription
	Username string  `json:"username"`
	Avatar   *string `json:"avatar"`
}
type SubscriptionListPagination struct {
	Subscriptions []SubscriptionWithUser `json:"subscriptions"`
	CurrentPage   int                    `json:"current_page"`
	LastPage      int                    `json:"last_page"`
	Limit         int                    `json:"limit"`
	TotalRecords  int                    `json:"total_records"`
}

type RevokeSubscriptionRequest struct {
	CancelReason string `json:"cancel_reason"`
}

type UpdateSubscriptionPriceRequest struct {
	Price float64 `json:"price"`
}

type UpdateTrialDaysRequest struct {
	TrialDays int `json:"trial_days"`
}
