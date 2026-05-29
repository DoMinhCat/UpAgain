package models

import "time"

type StepItem struct {
	Id    int    `json:"id"`
	Title string `json:"title"`
}

type ProjectStep struct {
	Id          int        `json:"id"`
	CreatedAt   time.Time  `json:"created_at"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	IdPost      int        `json:"id_post"`
	Items       []StepItem `json:"items"`
	Photos      []string   `json:"photos"`
}

type StepInsertPayload struct {
	IdPost      int      `json:"id_post"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	ItemIds     []int    `json:"item_ids"`
	Images      []string `json:"images"`
}