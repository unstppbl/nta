package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

// Note represents a note in the application
type Note struct {
	ID           int       `json:"id"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	CreatedAt    time.Time `json:"created_at"`
	LastModified time.Time `json:"last_modified"`
}

// Line represents a line in a note with timestamp
type Line struct {
	ID        int       `json:"id"`
	NoteID    int       `json:"note_id"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

// Server struct to manage database and router
type Server struct {
	db     *sql.DB
	router *mux.Router
}

func (s *Server) Initialize() error {
	// Get database path from environment variable or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./notetime.db" // Default value if not specified
	}

	// Initialize database
	var err error
	s.db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}

	log.Printf("Using database at: %s", dbPath)

	// Create tables if they don't exist
	createTablesQuery := `
	CREATE TABLE IF NOT EXISTS notes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		content TEXT,
		created_at TIMESTAMP,
		last_modified TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS lines (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		note_id INTEGER,
		content TEXT,
		timestamp TIMESTAMP,
		FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
	);
	`
	_, err = s.db.Exec(createTablesQuery)
	if err != nil {
		return err
	}

	// Initialize router
	s.router = mux.NewRouter()
	s.setupRoutes()
	return nil
}

// Setup API routes
func (s *Server) setupRoutes() {
	// Add health check endpoint
	s.router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		respondWithJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
	}).Methods("GET")

	// Existing routes
	s.router.HandleFunc("/api/notes", s.getAllNotes).Methods("GET")
	s.router.HandleFunc("/api/notes", s.createNote).Methods("POST")
	s.router.HandleFunc("/api/notes/{id:[0-9]+}", s.getNote).Methods("GET")
	s.router.HandleFunc("/api/notes/{id:[0-9]+}", s.updateNote).Methods("PUT")
	s.router.HandleFunc("/api/notes/{id:[0-9]+}", s.deleteNote).Methods("DELETE")

	// Lines endpoints
	s.router.HandleFunc("/api/notes/{id:[0-9]+}/lines", s.getLines).Methods("GET")
	s.router.HandleFunc("/api/notes/{id:[0-9]+}/lines", s.addLine).Methods("POST")

	// Search endpoint
	s.router.HandleFunc("/api/search", s.searchNotes).Methods("GET")

	// Serve static files for frontend
	s.router.PathPrefix("/").Handler(http.FileServer(http.Dir("./frontend/build")))
}

// Start the server
func (s *Server) Start(port string) {
	// CORS handling
	corsMiddleware := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Printf("Server started on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsMiddleware(s.router)))
}

// API handlers

// Get all notes
func (s *Server) getAllNotes(w http.ResponseWriter, r *http.Request) {
	sortBy := r.URL.Query().Get("sort")
	if sortBy == "" {
		sortBy = "last_modified" // Default sorting
	}

	var sortQuery string
	if sortBy == "creation_date" {
		sortQuery = "ORDER BY created_at DESC"
	} else {
		sortQuery = "ORDER BY last_modified DESC"
	}

	query := fmt.Sprintf("SELECT id, title, content, created_at, last_modified FROM notes %s", sortQuery)
	rows, err := s.db.Query(query)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	notes := []Note{}
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.CreatedAt, &n.LastModified); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		notes = append(notes, n)
	}

	respondWithJSON(w, http.StatusOK, notes)
}

// Get a specific note
func (s *Server) getNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var note Note
	query := "SELECT id, title, content, created_at, last_modified FROM notes WHERE id = ?"
	err := s.db.QueryRow(query, id).Scan(&note.ID, &note.Title, &note.Content, &note.CreatedAt, &note.LastModified)
	if err != nil {
		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusNotFound, "Note not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respondWithJSON(w, http.StatusOK, note)
}

// Create a new note
func (s *Server) createNote(w http.ResponseWriter, r *http.Request) {
	var note Note
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&note); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Set timestamps
	now := time.Now()
	note.CreatedAt = now
	note.LastModified = now

	// Default title if empty
	if note.Title == "" {
		note.Title = "Untitled Diary"
	}

	query := "INSERT INTO notes(title, content, created_at, last_modified) VALUES(?, ?, ?, ?)"
	result, err := s.db.Exec(query, note.Title, note.Content, note.CreatedAt, note.LastModified)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	note.ID = int(id)

	respondWithJSON(w, http.StatusCreated, note)
}

// Update an existing note
func (s *Server) updateNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var note Note
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&note); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Update timestamp
	note.LastModified = time.Now()

	query := "UPDATE notes SET title = ?, content = ?, last_modified = ? WHERE id = ?"
	_, err := s.db.Exec(query, note.Title, note.Content, note.LastModified, id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	note.ID = parseInt(id)
	respondWithJSON(w, http.StatusOK, note)
}

// Delete a note
func (s *Server) deleteNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	query := "DELETE FROM notes WHERE id = ?"
	_, err := s.db.Exec(query, id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Note deleted successfully"})
}

// Get lines for a specific note
func (s *Server) getLines(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	noteID := vars["id"]

	query := "SELECT id, note_id, content, timestamp FROM lines WHERE note_id = ? ORDER BY timestamp ASC"
	rows, err := s.db.Query(query, noteID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	lines := []Line{}
	for rows.Next() {
		var l Line
		if err := rows.Scan(&l.ID, &l.NoteID, &l.Content, &l.Timestamp); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		lines = append(lines, l)
	}

	respondWithJSON(w, http.StatusOK, lines)
}

// Add a line to a note
func (s *Server) addLine(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	noteID := vars["id"]

	var line Line
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&line); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Set timestamp
	line.Timestamp = time.Now()
	line.NoteID = parseInt(noteID)

	query := "INSERT INTO lines(note_id, content, timestamp) VALUES(?, ?, ?)"
	result, err := s.db.Exec(query, line.NoteID, line.Content, line.Timestamp)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	line.ID = int(id)

	// Also update the last_modified timestamp of the parent note
	updateQuery := "UPDATE notes SET last_modified = ? WHERE id = ?"
	_, err = s.db.Exec(updateQuery, line.Timestamp, noteID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, line)
}

// Search notes
func (s *Server) searchNotes(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		respondWithError(w, http.StatusBadRequest, "Search query is required")
		return
	}

	searchQuery := "SELECT id, title, content, created_at, last_modified FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY last_modified DESC"
	rows, err := s.db.Query(searchQuery, "%"+query+"%", "%"+query+"%")
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	notes := []Note{}
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.CreatedAt, &n.LastModified); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		notes = append(notes, n)
	}

	respondWithJSON(w, http.StatusOK, notes)
}

// Helper functions

// Respond with JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// Respond with error
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

// Parse string to int
func parseInt(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}

func main() {
	server := Server{}
	err := server.Initialize()
	if err != nil {
		log.Fatal("Failed to initialize server: ", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server.Start(port)
}
