package main

import (
	"log"
	"net/http"
	"time"

	"github.com/KennyMwendwaX/reformat/internal/handlers"
)

func main() {
	// Conversion endpoint
	http.HandleFunc("/api/convert", handlers.Convert)

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
