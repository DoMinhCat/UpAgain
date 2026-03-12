package middleware

import (
	"backend/db"
	"backend/models"
	authUtils "backend/utils/auth"
	"context"
	"log/slog"
	"net/http"
	"strings"
)

func UpdateLastActive(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value("user").(models.AuthClaims)

		// If not in context (ex: guest routes), manually parse token
		if !ok {
			authHeader := r.Header.Get("Authorization")
			// if there is JWT attached
			if authHeader != "" {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")
				claims, err := authUtils.ParseJWT(tokenString)
				if err == nil {
					user = claims
					ok = true
					// Inject user into context for subsequent controllers even if it's a guest route
					r = r.WithContext(context.WithValue(r.Context(), "user", claims))
				}
			}
		}

		if !ok {
			next.ServeHTTP(w, r)
			return
		}
		accountID := user.Id

		err := db.UpdateLastActive(accountID)
		if err != nil {
			slog.Error("UpdateLastActive() failed", "account_id", accountID, "error", err)
		}

		next.ServeHTTP(w, r)
	})
}
