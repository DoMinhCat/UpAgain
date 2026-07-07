package mail

import (
	"backend/config"
	"crypto/tls"
	"fmt"

	"gopkg.in/gomail.v2"
)

// SmtpSender is implemented by *gomail.Dialer. Tests inject a fake
// implementation so sending can be verified without dialing a real
// SMTP server.
type SmtpSender interface {
	DialAndSend(m ...*gomail.Message) error
}

type Mailer struct {
	Sender SmtpSender
	From   string
}

// NewMailer builds a Mailer configured for the internal hMailServer
// instance. The .lan domain has no valid public certificate, hence
// InsecureSkipVerify.
func NewMailer() *Mailer {
	dialer := gomail.NewDialer(config.SmtpHost, config.SmtpPort, config.SmtpUser, config.SmtpPassword)
	dialer.TLSConfig = &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         "upcycleconnect.lan",
	}

	return &Mailer{
		Sender: dialer,
		From:   config.SmtpFrom,
	}
}

func (m *Mailer) SendMail(to, subject, htmlBody string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.From)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", htmlBody)

	if err := m.Sender.DialAndSend(msg); err != nil {
		return fmt.Errorf("error sending mail via SMTP: %w", err)
	}
	return nil
}
