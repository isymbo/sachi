package utils

import (
	"log"
	"os"
	"path/filepath"
)

// IsDocker checks if the application is running in a Docker container
func IsDocker() bool {
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return true
	}
	return false
}

// EnsureDir creates a directory if it doesn't exist
func EnsureDir(dirPath string) error {
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return os.MkdirAll(dirPath, 0755)
	}
	return nil
}

// GetLogPath returns the log file path
func GetLogPath(dataDir string) string {
	logDir := filepath.Join(dataDir, "logs")
	if err := EnsureDir(logDir); err != nil {
		log.Printf("Failed to create log directory: %v", err)
		return ""
	}
	return filepath.Join(logDir, "sachi.log")
}

// FileExists checks if a file exists
func FileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

// DirExists checks if a directory exists
func DirExists(dirname string) bool {
	info, err := os.Stat(dirname)
	if os.IsNotExist(err) {
		return false
	}
	return info.IsDir()
}
