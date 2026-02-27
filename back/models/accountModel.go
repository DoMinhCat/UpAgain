package models

type CreateAccountRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
	Phone    string `json:"phone"`
}
