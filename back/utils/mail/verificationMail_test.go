package mail

import (
	"strings"
	"testing"
)

func TestBuildWelcomeVerificationEmail(t *testing.T) {
	subject, body := BuildWelcomeVerificationEmail("jane", "http://localhost:8080/verify-email/abc123/")

	if subject == "" {
		t.Error("expected a non-empty subject")
	}
	if !strings.Contains(body, "jane") {
		t.Errorf("expected body to contain the username, got: %s", body)
	}
	if !strings.Contains(body, "http://localhost:8080/verify-email/abc123/") {
		t.Errorf("expected body to contain the verify URL, got: %s", body)
	}
}
