# Sachi - AI-Powered Analytics Platform

Now rebuilt with Go + Fiber backend following BanBot architecture!

## Architecture

This project follows the same architectural patterns as BanBot:

### Directory Structure
```
sachi/
├── main.go              # Application entry point
├── go.mod               # Go module definition
├── config/              # Configuration management
├── core/                # Core application logic and lifecycle
├── docker/              # Docker configuration
├── entry/               # Command-line interface and mode selection
├── orm/                 # Database layer (SQLite)
├── utils/               # Utility functions
├── web/                 # Web server and API
│   ├── dev/            # Development server
│   └── static/         # Landing page assets (HTML, CSS, JS)
└── docker/             # Docker deployment configuration
```

### Multi-Mode Operation

The application supports multiple operation modes just like BanBot:

1. **Web UI Mode** (default):
   ```bash
   ./sachi
   ./sachi web
   ./sachi web --port 8080 --host 0.0.0.0
   ```

2. **Command-line Interface**:
   ```bash
   ./sachi version
   ./sachi help
   ./sachi web --help
   ```

### Technology Stack

**Backend:**
- Go 1.23+ with Fiber v2 web framework
- SQLite database with custom ORM
- JWT authentication support
- WebSocket capability (via Fiber contrib)

**Frontend:**
- Preserved original HTML/CSS/JS assets in `web/static/`
- Integrated with new Go backend
- API endpoints for dynamic functionality
- Responsive design with modern UI components

### Getting Started

1. **Build and run:**
   ```bash
   go mod tidy
   go build
   ./sachi
   ```

2. **Or run directly:**
   ```bash
   go run main.go
   ```

3. **With custom settings:**
   ```bash
   ./sachi web --port 3000 --host 127.0.0.1 --datadir ./data
   ```

4. **Using Docker:**
   ```bash
   cd docker
   docker-compose up
   ```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/info` - Application information
- `GET /api/assets` - Static assets info

### Database

Uses SQLite with automatic table creation:
- `users` - User management
- `sessions` - Session management  
- `settings` - Application settings

Data is stored in `~/.sachi/sachi.db` by default or as specified by `--datadir` flag.

### Development

The application maintains backward compatibility with the original frontend while adding:
- Robust Go backend architecture
- Multi-mode CLI interface  
- Database persistence
- API endpoints for future enhancements
- Docker deployment support
- Static assets served from `web/static/` directory

**Default server binding:** The web server now binds to `0.0.0.0:8000` by default, making it accessible from external connections. Use `--host 127.0.0.1` to restrict to localhost only.

## Project Cleanup

After successfully moving all landing page assets to `web/static/`, the following duplicate files in the root directory can be safely removed:

```bash
# Remove duplicate HTML files (now in web/static/)
rm -f *.html

# Remove duplicate CSS directory (now in web/static/css/)
rm -rf css/

# Remove duplicate JS directory (now in web/static/js/)
rm -rf js/

# Remove Node.js related files (replaced by Go backend)
rm -rf node_modules/
rm -f package.json package-lock.json server.js

# Remove old asset management scripts (no longer needed)
rm -f copy-assets.sh move-assets.sh
```

This creates a solid foundation for future feature development while preserving the existing user interface.
