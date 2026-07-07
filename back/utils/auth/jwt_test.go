package utils

import (
	"os"
	"testing"
	"time"

	"backend/utils"

	"github.com/golang-jwt/jwt/v5"
)

func TestMain(m *testing.M) {
	os.Setenv("JWT_SECRET", "test-secret-for-jwt-unit-tests")
	os.Exit(m.Run())
}

func TestGenerateAndParseEmailVerificationToken(t *testing.T) {
	token, err := GenerateEmailVerificationToken(42, "jane@example.com")
	if err != nil {
		t.Fatalf("expected no error generating token, got %v", err)
	}

	id, email, err := ParseEmailVerificationToken(token)
	if err != nil {
		t.Fatalf("expected no error parsing token, got %v", err)
	}
	if id != 42 {
		t.Errorf("expected id_account 42, got %d", id)
	}
	if email != "jane@example.com" {
		t.Errorf("expected email jane@example.com, got %s", email)
	}
}

func TestParseEmailVerificationToken_Expired(t *testing.T) {
	claims := jwt.MapClaims{
		"id_account": 42,
		"email":      "jane@example.com",
		"purpose":    EmailVerificationPurpose,
		"exp":        time.Now().Add(-time.Hour).Unix(),
		"iat":        time.Now().Add(-time.Hour * 2).Unix(),
	}
	expired := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := expired.SignedString(utils.GetJWTSecret())
	if err != nil {
		t.Fatalf("failed to sign test token: %v", err)
	}

	_, _, err = ParseEmailVerificationToken(signed)
	if err == nil {
		t.Fatal("expected an error for an expired token, got nil")
	}
}

func TestParseEmailVerificationToken_RejectsWrongPurpose(t *testing.T) {
	// A regular login token has no "purpose" claim and must not be
	// accepted as an email verification token.
	loginToken, err := GenerateJWT("jane@example.com", "user", 42, "jane")
	if err != nil {
		t.Fatalf("failed to generate login token: %v", err)
	}

	_, _, err = ParseEmailVerificationToken(loginToken)
	if err == nil {
		t.Fatal("expected an error when parsing a login token as an email verification token, got nil")
	}
}
