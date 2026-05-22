package models

import "time"

type Barcode struct {
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
	BarcodeBase64 string    `json:"barcode_base64"`
}

type BarCodeData struct {
	Id            int    `json:"id"`
	IdTransaction string `json:"id_transaction"`
	UserType      string `json:"user_type"`
	IdAccount     int    `json:"id_account"`
}

type BarCodeInsert struct {
	Code6Digit  string    `json:"code6digit"`
	BarcodePath string    `json:"barcodePath"`
	UserType    string    `json:"userType"`
	IdAccount   int       `json:"idAccount"`
	IdDeposit   int       `json:"idDeposit"`
	IdTransaction string    `json:"idTransaction"`
	ValidFrom   time.Time `json:"validFrom"`
}