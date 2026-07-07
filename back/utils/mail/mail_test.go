package mail

import (
	"errors"
	"testing"

	"gopkg.in/gomail.v2"
)

type fakeSender struct {
	lastMessage *gomail.Message
	err         error
}

func (f *fakeSender) DialAndSend(m ...*gomail.Message) error {
	if len(m) > 0 {
		f.lastMessage = m[0]
	}
	return f.err
}

func TestSendMail_Success(t *testing.T) {
	fake := &fakeSender{}
	mailer := &Mailer{Sender: fake, From: "noreply@upcycleconnect.lan"}

	err := mailer.SendMail("user@example.com", "Test subject", "<p>hello</p>")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if fake.lastMessage == nil {
		t.Fatal("expected a message to be sent")
	}
	if got := fake.lastMessage.GetHeader("To"); len(got) != 1 || got[0] != "user@example.com" {
		t.Errorf("expected To header to be user@example.com, got %v", got)
	}
	if got := fake.lastMessage.GetHeader("From"); len(got) != 1 || got[0] != "noreply@upcycleconnect.lan" {
		t.Errorf("expected From header to be noreply@upcycleconnect.lan, got %v", got)
	}
	if got := fake.lastMessage.GetHeader("Subject"); len(got) != 1 || got[0] != "Test subject" {
		t.Errorf("expected Subject header to be 'Test subject', got %v", got)
	}
}

func TestSendMail_PropagatesError(t *testing.T) {
	fake := &fakeSender{err: errors.New("smtp connection refused")}
	mailer := &Mailer{Sender: fake, From: "noreply@upcycleconnect.lan"}

	err := mailer.SendMail("user@example.com", "Test subject", "<p>hello</p>")
	if err == nil {
		t.Fatal("expected an error, got nil")
	}
}
