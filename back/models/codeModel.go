package models

import "time"

type CodeForAdmin struct {
	Path          string    `json:"path"`
	Code          string    `json:"code"`
	ValidFrom     time.Time `json:"valid_from"`
	ValidTo       time.Time `json:"valid_to"`
	Status        string    `json:"status"`
	UserType      string    `json:"user_type"`
	IdAccount     int       `json:"id_account"`
	IdDeposit     int       `json:"id_deposit"`
	IdTransaction string    `json:"id_transaction"`
	IdContainer   int       `json:"id_container"`
}
