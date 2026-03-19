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
	DateStart        null.Time   `json:"date_start"`
	Capacity         null.Int    `json:"capacity"`
	Price            null.Float  `json:"price"`
	CreatedAt        time.Time   `json:"created_at"`
	EmployeeID       null.Int    `json:"id_employee"`
	EmployeeUsername null.String `json:"employee_username"`
}

type ValidationActionRequest struct {
	Action string `json:"action"`
	Reason string `json:"reason"`
}

type AllItemResponse struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	Username  string    `json:"username"`
	ItemType  string    `json:"item_type"`
}

// --- Paginated responses ---

type PaginatedDepositsResponse struct {
	Deposits     []PendingDepositResponse `json:"deposits"`
	CurrentPage  int                      `json:"current_page"`
	LastPage     int                      `json:"last_page"`
	Limit        int                      `json:"limit"`
	TotalRecords int                      `json:"total_records"`
}

type PaginatedListingsResponse struct {
	Listings     []PendingListingResponse `json:"listings"`
	CurrentPage  int                      `json:"current_page"`
	LastPage     int                      `json:"last_page"`
	Limit        int                      `json:"limit"`
	TotalRecords int                      `json:"total_records"`
}

type PaginatedEventsResponse struct {
	Events       []PendingEventResponse `json:"events"`
	CurrentPage  int                    `json:"current_page"`
	LastPage     int                    `json:"last_page"`
	Limit        int                    `json:"limit"`
	TotalRecords int                    `json:"total_records"`
}

// --- Stats ---

type ValidationStats struct {
	PendingDeposits  int `json:"pending_deposits"`
	ApprovedDeposits int `json:"approved_deposits"`
	RefusedDeposits  int `json:"refused_deposits"`
	PendingListings  int `json:"pending_listings"`
	ApprovedListings int `json:"approved_listings"`
	RefusedListings  int `json:"refused_listings"`
	PendingEvents    int `json:"pending_events"`
	ApprovedEvents   int `json:"approved_events"`
	RefusedEvents    int `json:"refused_events"`
}

// ValidationFilters holds optional filter params for pending validation queries
type ValidationFilters struct {
	Search string
	Sort   string
}