package models

type ValidationResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   int    `json:"error"`
}
