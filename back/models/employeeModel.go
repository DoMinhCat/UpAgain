package models

import (
	"time"
)

type EmployeeStats struct {
	TotalEvents int `json:"total_events"`
	TotalPosts  int `json:"total_posts"`
}

type AssignedEmployee struct {
	Id         int       `json:"id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	AssignedAt time.Time `json:"assigned_at"`
}

type AvailableEmployeesRequest struct {
	From time.Time `json:"start_at"`
	To   time.Time `json:"end_at"`
}

type AvailableEmployee struct {
	Id       int    `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

type AvailableEmployeesResponse struct {
	Employees []AvailableEmployee `json:"employees"`
}
