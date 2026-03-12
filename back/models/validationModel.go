package models

type ValidationResponse struct {
	Success bool  `json:"success"`
	Message error `json:"message"`
	Error   int   `json:"error"`
}
