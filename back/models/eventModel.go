package models

type EventStats struct {
	Total            int `json:"total"`
	NewEvents        int `json:"increase"`
	UpcomingEvents   int `json:"upcoming"`
	Registrations    int `json:"registrations"`
	PendingApprovals int `json:"pending"`
}