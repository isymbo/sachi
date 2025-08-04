package config

import (
	"fmt"
	"os"
	"path/filepath"
)

// CmdArgs represents command line arguments
type CmdArgs struct {
	Port     int
	Host     string
	LogLevel string
	DataDir  string
	DBFile   string
}

// Global configuration variables
var (
	Args *CmdArgs
)

// Init initializes the configuration
func Init(cmdArgs *CmdArgs) error {
	Args = cmdArgs

	// Set default data directory if not specified
	if Args.DataDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return fmt.Errorf("failed to get user home directory: %v", err)
		}
		Args.DataDir = filepath.Join(homeDir, ".sachi")
	}

	// Create data directory if it doesn't exist
	if err := os.MkdirAll(Args.DataDir, 0755); err != nil {
		return fmt.Errorf("failed to create data directory: %v", err)
	}

	// Set absolute path for database file
	if !filepath.IsAbs(Args.DBFile) {
		Args.DBFile = filepath.Join(Args.DataDir, Args.DBFile)
	}

	return nil
}
