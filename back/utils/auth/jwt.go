package utils

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const EmailVerificationPurpose = "email_verification"

// short lived access token (15 minutes)
func GenerateJWT(email string, role string, id int, username string) (string, error) {
	claims := jwt.MapClaims{
		"id_account": id,
		"email":      email,
		"username":   username,
		"role":       role,
		"exp":        time.Now().Add(time.Minute * 15).Unix(),
		"iat":        time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(utils.GetJWTSecret())
}

// long lived refresh token (1 week) to create new access token
func GenerateRefreshToken(email string, role string, id int, username string) (string, error) {
	claims := jwt.MapClaims{
		"id_account": id,
		"email":      email,
		"username":   username,
		"role":       role,
		"exp":        time.Now().Add(time.Hour * 24 * 7).Unix(),
		"iat":        time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(utils.GetJWTSecret())
}

func ParseJWT(tokenString string) (models.AuthClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return utils.GetJWTSecret(), nil
	})

	if err != nil {
		return models.AuthClaims{}, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		idFloat, _ := claims["id_account"].(float64)
		idAccount := int(idFloat)
		email, _ := claims["email"].(string)
		role, _ := claims["role"].(string)
		username, _ := claims["username"].(string)

		return models.AuthClaims{
			Id:       idAccount,
			Email:    email,
			Role:     role,
			Username: username,
		}, nil
	}
	return models.AuthClaims{}, fmt.Errorf("invalid token")
}

// GenerateEmailVerificationToken creates a token valid for 24h, used to
// confirm ownership of the email address given at registration.
func GenerateEmailVerificationToken(id int, email string) (string, error) {
	claims := jwt.MapClaims{
		"id_account": id,
		"email":      email,
		"purpose":    EmailVerificationPurpose,
		"exp":        time.Now().Add(time.Hour * 24).Unix(),
		"iat":        time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(utils.GetJWTSecret())
}

// ParseEmailVerificationToken validates the token and rejects any token
// not issued for email verification (e.g. a login or refresh token).
func ParseEmailVerificationToken(tokenString string) (int, string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return utils.GetJWTSecret(), nil
	})
	if err != nil {
		return 0, "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return 0, "", fmt.Errorf("invalid token")
	}

	purpose, _ := claims["purpose"].(string)
	if purpose != EmailVerificationPurpose {
		return 0, "", fmt.Errorf("invalid token purpose")
	}

	idFloat, _ := claims["id_account"].(float64)
	email, _ := claims["email"].(string)

	return int(idFloat), email, nil
}
