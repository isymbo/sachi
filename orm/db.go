package orm

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

var DB *sql.DB

// schema feature flags (detected at runtime)
var usersNameColumn = "name" // either "name" or legacy "username"
var hasCompanyColumn = true  // some legacy DBs may miss company

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

	// Improve SQLite performance and concurrency
	if _, err := DB.Exec(`PRAGMA journal_mode = WAL;`); err != nil {
		log.Printf("warning: failed to set journal_mode=WAL: %v", err)
	}
	if _, err := DB.Exec(`PRAGMA synchronous = NORMAL;`); err != nil {
		log.Printf("warning: failed to set synchronous=NORMAL: %v", err)
	}
	if _, err := DB.Exec(`PRAGMA foreign_keys = ON;`); err != nil {
		log.Printf("warning: failed to enable foreign_keys: %v", err)
	}

	// Create tables (no-op if they exist)
	if err = createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %v", err)
	}

	// Detect existing schema for backward compatibility
	if err = detectUsersSchema(); err != nil {
		return fmt.Errorf("failed to detect users schema: %v", err)
	}

	log.Printf("Database initialized successfully at %s", dbPath)
	return nil
}

// createTables creates the necessary database tables
func createTables() error {
	// Users table for basic user management (modern schema)
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		company TEXT,
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

	// Indexes to speed up common queries
	indexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`,
	}
	for _, idx := range indexes {
		if _, err := DB.Exec(idx); err != nil {
			return fmt.Errorf("failed to create index: %v", err)
		}
	}

	return nil
}

// detectUsersSchema inspects the users table columns to adapt to legacy schemas
func detectUsersSchema() error {
	// defaults for a fresh DB
	usersNameColumn = "name"
	hasCompanyColumn = true

	// check if users table exists
	row := DB.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
	var t string
	if err := row.Scan(&t); err != nil {
		// table may not exist yet; keep defaults
		return nil
	}

	// inspect columns
	cols, err := DB.Query("PRAGMA table_info(users)")
	if err != nil {
		return err
	}
	defer cols.Close()

	hasName := false
	hasUsername := false
	hasCompany := false
	for cols.Next() {
		var cid int
		var name string
		var ctype sql.NullString
		var notnull, pk int
		var dflt sql.NullString
		if err := cols.Scan(&cid, &name, &ctype, &notnull, &dflt, &pk); err != nil {
			return err
		}
		switch name {
		case "name":
			hasName = true
		case "username":
			hasUsername = true
		case "company":
			hasCompany = true
		}
	}
	if err := cols.Err(); err != nil {
		return err
	}

	// prefer modern name column, else fall back to legacy username
	if hasName {
		usersNameColumn = "name"
	} else if hasUsername {
		usersNameColumn = "username"
	}
	hasCompanyColumn = hasCompany

	log.Printf("users schema detected: nameColumn=%s, hasCompany=%v", usersNameColumn, hasCompanyColumn)
	return nil
}

func joinCols(cols []string) string { return strings.Join(cols, ", ") }

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// User represents a user in the database
type User struct {
	ID           int64
	Name         string
	Email        string
	Company      string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// CreateUser creates a new user in the database
func CreateUser(name, email, company, passwordHash string) (int64, error) {
	// Build insert dynamically to handle legacy schemas
	cols := []string{usersNameColumn, "email"}
	args := []any{name, email}
	if hasCompanyColumn {
		cols = append(cols, "company")
		args = append(args, company)
	}
	cols = append(cols, "password_hash")
	args = append(args, passwordHash)

	placeholders := "?"
	for i := 1; i < len(cols); i++ {
		placeholders += ", ?"
	}
	query := fmt.Sprintf("INSERT INTO users(%s) VALUES(%s)", joinCols(cols), placeholders)

	stmt, err := DB.Prepare(query)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(args...)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

// GetUserByEmail retrieves a user from the database by their email address
func GetUserByEmail(email string) (*User, error) {
	// Build select to support legacy schemas
	selectCols := fmt.Sprintf("id, %s, email", usersNameColumn)
	if hasCompanyColumn {
		selectCols += ", company"
	}
	selectCols += ", password_hash, created_at, updated_at"
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = ?", selectCols)
	row := DB.QueryRow(query, email)

	user := &User{}
	if hasCompanyColumn {
		if err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Company, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, err
		}
	} else {
		if err := row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, err
		}
		user.Company = ""
	}

	return user, nil
}

// CreateSession creates a new session for a user
func CreateSession(userID int64) (string, error) {
	sessionToken := uuid.New().String()
	expiresAt := time.Now().Add(24 * time.Hour)

	stmt, err := DB.Prepare("INSERT INTO sessions(user_id, session_token, expires_at) VALUES(?, ?, ?)")
	if err != nil {
		return "", err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, sessionToken, expiresAt)
	if err != nil {
		return "", err
	}

	return sessionToken, nil
}

// ValidateSession validates a session token and returns the user ID if valid
func ValidateSession(sessionToken string) (*User, error) {
	// Get session and user information
	selCols := fmt.Sprintf("u.id, u.%s, u.email", usersNameColumn)
	if hasCompanyColumn {
		selCols += ", u.company"
	}
	selCols += ", u.password_hash, u.created_at, u.updated_at"
	query := fmt.Sprintf(`
		SELECT %s
		FROM users u 
		INNER JOIN sessions s ON u.id = s.user_id 
		WHERE s.session_token = ? AND s.expires_at > ?`, selCols)

	row := DB.QueryRow(query, sessionToken, time.Now())

	user := &User{}
	var err error
	if hasCompanyColumn {
		err = row.Scan(&user.ID, &user.Name, &user.Email, &user.Company, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	} else {
		err = row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
		user.Company = ""
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// CleanupExpiredSessions removes old sessions. Call periodically instead of on every ValidateSession.
func CleanupExpiredSessions() error {
	_, err := DB.Exec("DELETE FROM sessions WHERE expires_at < ?", time.Now())
	return err
}

// DeleteSession deletes a session
func DeleteSession(sessionToken string) error {
	stmt, err := DB.Prepare("DELETE FROM sessions WHERE session_token = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(sessionToken)
	return err
}

// UpdateUser updates user profile information
func UpdateUser(userID int64, name, email, company string) error {
	// Build update for profile
	setClause := fmt.Sprintf("%s = ?, email = ?", usersNameColumn)
	args := []any{name, email}
	if hasCompanyColumn {
		setClause += ", company = ?"
		args = append(args, company)
	}
	setClause += ", updated_at = CURRENT_TIMESTAMP"
	query := fmt.Sprintf("UPDATE users SET %s WHERE id = ?", setClause)
	args = append(args, userID)

	stmt, err := DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(args...)
	return err
}

// UpdateUserPassword updates user password
func UpdateUserPassword(userID int64, passwordHash string) error {
	stmt, err := DB.Prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(passwordHash, userID)
	return err
}
