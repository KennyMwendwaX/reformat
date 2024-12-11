package main

import (
	"log"
	"net/http"
	"time"

	"github.com/KennyMwendwaX/reformat/internal/handlers"
)

// CORS middleware to allow cross-origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Allow requests from your frontend
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")   // Allowed HTTP methods
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")         // Allowed headers

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Conversion endpoint
	http.Handle("/api/convert", corsMiddleware(http.HandlerFunc(handlers.Convert)))

	// Configure server with reasonable timeouts
	server := &http.Server{
		Addr:         ":8000",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second, // Longer timeout for file conversions
	}

	log.Printf("Starting server on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
