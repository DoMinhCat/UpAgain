package middleware

import (
	respond "backend/utils"
	utils "backend/utils/auth"
	"context"
	"net/http"
	"slices"
	"strings"
)

func AuthMiddleware(requiredRole []string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respond.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := utils.ParseJWT(tokenString)
		if err != nil {
			respond.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
			return
		}

		if !slices.Contains(requiredRole, claims.Role) {
			respond.RespondWithError(w, http.StatusUnauthorized, "You need to log in first.")
			return
		}
		ctx := context.WithValue(r.Context(), "user", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
