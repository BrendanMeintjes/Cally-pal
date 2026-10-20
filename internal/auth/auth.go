package auth

import (
	"context"
	"net/http"
)

type contextKey string

const userKey contextKey = "user"

// User holds the authenticated user's identity.
type User struct {
	ID    string
	Email string
}

// FromContext returns the authenticated user from the request context, or nil.
func FromContext(ctx context.Context) *User {
	u, _ := ctx.Value(userKey).(*User)
	return u
}

// WithUser injects a user into a context directly (used in Phase 3 for hardcoded user).
func WithUser(ctx context.Context, u *User) context.Context {
	return context.WithValue(ctx, userKey, u)
}

// Middleware is a passthrough for Phase 3.
// Phase 5 replaces this with real JWKS-based JWT verification.
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}
