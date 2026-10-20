package graph

import "github.com/jackc/pgx/v5/pgxpool"

// Resolver is the root resolver. Dependencies are injected here.
type Resolver struct {
	Pool *pgxpool.Pool
}
