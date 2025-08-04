#!/bin/bash

echo "🚀 Testing Sachi Architecture..."
echo ""

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo "❌ go.mod not found"
    exit 1
fi

echo "✅ Go module found"

# Check directory structure
directories=("config" "core" "docker" "entry" "orm" "utils" "web" "web/static" "web/dev")
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Directory missing: $dir"
    fi
done

# Check key files
files=("main.go" "web/static/index.html" "web/static/css/styles.css" "web/static/js/main.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ File exists: $file"
    else
        echo "❌ File missing: $file"
    fi
done

echo ""
echo "📁 Landing page files in web/static:"
ls -la web/static/ 2>/dev/null || echo "❌ web/static directory not accessible"

echo ""
echo "🔧 Build test:"
go mod tidy
if go build -o sachi; then
    echo "✅ Build successful"
    
    echo ""
    echo "📋 Available commands:"
    ./sachi help 2>/dev/null || echo "Help command output will be available after full build"
    
    echo ""
    echo "🌐 Server configuration:"
    echo "  Default host: 0.0.0.0 (accessible externally)"
    echo "  Default port: 8000"
    echo "  Landing page served from: web/static/"
    echo ""
    echo "🚀 To start the web server:"
    echo "  ./sachi                           # Default (0.0.0.0:8000)"
    echo "  ./sachi web --host 127.0.0.1     # Localhost only"
    echo "  ./sachi web --port 3000          # Custom port"
    echo ""
    echo "🐳 To run with Docker:"
    echo "  cd docker && docker-compose up"
    
else
    echo "❌ Build failed - check dependencies"
fi

echo ""
echo "✨ Sachi architecture test complete!"
