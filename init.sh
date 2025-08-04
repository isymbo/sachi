#!/bin/bash

echo "Initializing Sachi project..."

# Initialize Go modules
echo "Running go mod tidy..."
go mod tidy

# Build the project
echo "Building project..."
go build -o sachi

# Test different modes
echo "Testing version command..."
./sachi version

echo "Testing help command..."  
./sachi help

echo ""
echo "Project structure created successfully!"
echo ""
echo "Available commands:"
echo "  ./sachi              # Start web server (default)"
echo "  ./sachi web          # Start web server explicitly"
echo "  ./sachi version      # Show version"
echo "  ./sachi help         # Show help"
echo ""
echo "Web server options:"  
echo "  ./sachi web --port 3000 --host 127.0.0.1  # Localhost only"
echo "  ./sachi web --host 0.0.0.0 --port 8000     # External access (default)"
echo "  ./sachi web --datadir ./custom-data"
echo ""
echo "Docker deployment:"
echo "  cd docker && docker-compose up"
