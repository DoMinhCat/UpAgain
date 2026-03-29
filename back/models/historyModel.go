package models

import "time"

type HistoryFilters struct {
	Search string
	Sort   string
	Module string
	Action string
}

type History struct {
	Id          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	Module      string    `json:"module"`
	ItemId      int       `json:"item_id"`
	Action      string    `json:"action"`
	OldState    string    `json:"old_state"`
	NewState    string    `json:"new_state"`
	AdminId     int       `json:"admin_id"`
	AdminName   string    `json:"admin_name"`
}

type HistoryListPagination struct {
	Histories    []History `json:"histories"`
	CurrentPage  int       `json:"current_page"`
	LastPage     int       `json:"last_page"`
	Limit        int       `json:"limit"`
	TotalRecords int       `json:"total_records"`
}