package orm

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// Init initializes the database connection
func Init(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	// Create tables
	if err = createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %v", err)
	}

	log.Printf("Database initialized successfully at %s", dbPath)
	return nil
}

// createTables creates the necessary database tables
func createTables() error {
	// Users table for basic user management
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Sessions table for user sessions
	createSessionsTable := `
	CREATE TABLE IF NOT EXISTS sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		session_token TEXT NOT NULL UNIQUE,
		expires_at DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);`

	// App settings table
	createSettingsTable := `
	CREATE TABLE IF NOT EXISTS settings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL UNIQUE,
		value TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	tables := []string{createUsersTable, createSessionsTable, createSettingsTable}

	for _, table := range tables {
		if _, err := DB.Exec(table); err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	return nil
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
