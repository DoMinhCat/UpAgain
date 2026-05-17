package helpers

import (
	"math/rand"
)

// GenerateRandom6CharCode generates a random 6-character code for many purposes
func GenerateRandom6CharCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
