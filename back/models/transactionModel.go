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

type TransactionsPaginationResponse struct {
	TotalTransactions int           `json:"total_transactions"`
	Transactions      []Transaction `json:"transactions"`
	CurrentPage       int           `json:"current_page"`
	LastPage          int           `json:"last_page"`
	Limit             int           `json:"limit"`
}