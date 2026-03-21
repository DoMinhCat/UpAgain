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
	AssignedAt time.Time `json:"assigned_at"`
}

type AvailableEmployeesRequest struct{
	From time.Time `json:"from"`
	To time.Time `json:"to"`
}