package utils

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) []byte{
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return hashed
}

func IsPasswordCorrect(existing string, creds string) bool{
	return bcrypt.CompareHashAndPassword([]byte(existing), []byte(creds)) == nil
}