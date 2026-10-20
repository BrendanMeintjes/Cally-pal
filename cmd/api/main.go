package main

import (
	"cally-pal/graph"
	"cally-pal/graph/generated"
	"cally-pal/internal/auth"
	"cally-pal/internal/db"
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load .env file (ignored in production where env vars are set directly)
	_ = godotenv.Load()

	// Connect to Supabase Postgres
	pool, err := db.New(context.Background())
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()
	log.Println("connected to database")

	// Build the GraphQL server
	srv := handler.NewDefaultServer(
		generated.NewExecutableSchema(generated.Config{
			Resolvers: &graph.Resolver{Pool: pool},
		}),
	)

	// CORS — allow the Vite dev server and production frontend
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{corsOrigin},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	mux := http.NewServeMux()
	mux.Handle("/query",      srv)
	mux.Handle("/playground", playground.Handler("Cally-pal GraphiQL", "/query"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API running on http://localhost:%s", port)
	log.Printf("GraphiQL at http://localhost:%s/playground", port)

	if err := http.ListenAndServe(":"+port, auth.Middleware(c.Handler(mux))); err != nil {
		log.Fatal(err)
	}
}
