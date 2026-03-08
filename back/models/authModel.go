package models

type AuthClaims struct {
	Id    int    `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AccountCreds struct {
	Id       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}
