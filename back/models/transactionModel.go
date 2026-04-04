package models

import "time"

type Transaction struct {
	Id            int       `json:"id"`
	IdTransaction string    `json:"id_transaction"`
	CreatedAt     time.Time `json:"created_at"`
	Action        string    `json:"action"`
	IdItem        int       `json:"id_item"`
	IdPro         int       `json:"id_pro"`
	UsernamePro   string    `json:"username_pro"`
}