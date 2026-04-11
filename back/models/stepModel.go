package models

import "time"

type ProjectStep struct {
	Id          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	IdPost      int       `json:"id_post"`
	StepOrder   int       `json:"step_order"`
	ItemIds     []int     `json:"item_ids"`
	Photos      []string   `json:"photos"`
}