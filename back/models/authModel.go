package models

type LoginResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AccountCreds struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}