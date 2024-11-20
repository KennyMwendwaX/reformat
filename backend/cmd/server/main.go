package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Set JSON content type
		w.Header().Set("Content-Type", "application/json")

		// Create a response object
		response := map[string]string{
			"message": "Server is running",
			"status":  "ok",
		}

		// Encode and send JSON
		if err := json.NewEncoder(w).Encode(response); err != nil {
			// Optional: log the error
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	})

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
