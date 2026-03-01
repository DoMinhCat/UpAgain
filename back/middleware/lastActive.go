package middleware

import (
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"time"
)

func UpdateLastActive(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value("user").(models.AuthClaims)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}
		accountID := user.Id

		_, err := utils.Conn.Exec("UPDATE accounts SET last_active = $1 WHERE id = $2 AND (last_active < $1 - INTERVAL '2 minutes' OR last_active IS NULL)", time.Now(), accountID)
		if err != nil {
			slog.Error("UpdateLastActive() failed", "account_id", accountID, "error", err)
		}

		next.ServeHTTP(w, r)
	})
}
