package mail

import "fmt"

// BuildWelcomeVerificationEmail returns the subject and HTML body for the
// email sent right after registration, asking the user to confirm their
// address via verifyURL.
func BuildWelcomeVerificationEmail(username, verifyURL string) (subject string, htmlBody string) {
	subject = "Bienvenue sur UpAgain, confirmez votre email"
	htmlBody = fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
			<h2>Bienvenue sur UpAgain, %s !</h2>
			<p>Merci de vous être inscrit. Confirmez votre adresse email en cliquant sur le lien ci-dessous :</p>
			<p><a href="%s">Confirmer mon email</a></p>
			<p>Ce lien expire dans 24 heures.</p>
		</div>
	`, username, verifyURL)
	return subject, htmlBody
}
