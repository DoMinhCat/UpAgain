package utils

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) string {
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashed)
}

func IsPasswordCorrect(existing string, creds string) bool {
	return bcrypt.CompareHashAndPassword([]byte(existing), []byte(creds)) == nil
}
