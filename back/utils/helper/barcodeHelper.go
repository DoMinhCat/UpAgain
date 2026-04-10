package helper

import (
	"math/rand"
)

// GenerateRandomCode generates a random 6-character code to open containers
func GenerateRandomCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
