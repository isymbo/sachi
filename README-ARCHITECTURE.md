# Sachi - Updated Architecture

Sachi has been upgraded to follow the banbot architecture pattern with Go backend and organized landing page assets.

## Project Structure

```
sachi/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── config/                 # Configuration management
├── core/                   # Core application logic and lifecycle
├── docker/                 # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── entry/                  # Command-line interface and startup logic
├── orm/                    # Database layer and models
├── utils/                  # Utility functions
└── web/                    # Web layer
    ├── main.go            # Web package entry
    ├── dev/               # Development web server
    └── static/            # Landing page assets
        ├── index.html     # Main landing page
        ├── product.html   # Product page
        ├── pricing.html   # Pricing page
        ├── about.html     # About page
        ├── login.html     # Login page
        ├── register.html  # Registration page
        ├── css/           # Stylesheets
        │   └── styles.css
        └── js/            # JavaScript files
            └── main.js
```

## Features Implemented

### ✅ **Architecture Upgrades**
- **Go Backend**: Migrated from Node.js/Express to Go/Fiber
- **Banbot Structure**: Same directory organization as banbot project
- **Multi-mode Operation**: Web UI and CLI commands
- **Database Integration**: SQLite with automatic schema creation

### ✅ **Landing Page Integration**
- **Static Assets**: All HTML/CSS/JS moved to `web/static/`
- **Fiber Serving**: Static files served via Fiber web framework
- **API Endpoints**: RESTful API for health, info, and assets
- **Responsive Design**: Mobile-friendly landing page

### ✅ **Command-Line Interface**
```bash
# Default (web server)
./sachi

# Explicit web command
./sachi web --port 3000 --host localhost

# CLI commands
./sachi version
./sachi help
```

### ✅ **Configuration Options**
- `--port`: Server port (default: 8000)
- `--host`: Bind address (default: 127.0.0.1)
- `--datadir`: Data directory path
- `--db`: Database file path
- `--level`: Log level

## Quick Start

### 1. Build and Run
```bash
# Initialize dependencies
go mod tidy

# Build the application
go build -o sachi

# Start web server
./sachi
```

### 2. Access Landing Page
- **Home**: http://localhost:8000/
- **Product**: http://localhost:8000/product.html
- **Pricing**: http://localhost:8000/pricing.html
- **About**: http://localhost:8000/about.html
- **Login**: http://localhost:8000/login.html
- **Register**: http://localhost:8000/register.html

### 3. API Endpoints
- **Health Check**: http://localhost:8000/api/health
- **App Info**: http://localhost:8000/api/info
- **Assets Info**: http://localhost:8000/api/assets

## Docker Deployment

```bash
# Using docker-compose
cd docker
docker-compose up

# Direct Docker build
docker build -f docker/Dockerfile -t sachi .
docker run -p 8000:8000 sachi
```

## Development

### File Organization
- **Frontend Assets**: Place all HTML, CSS, JS in `web/static/`
- **API Routes**: Add new routes in `web/dev/main.go`
- **Database Models**: Add tables in `orm/db.go`
- **Configuration**: Modify `config/config.go`
- **Utilities**: Add helpers in `utils/utils.go`

### Adding New Pages
1. Create HTML file in `web/static/`
2. Update navigation links in existing pages
3. Add any specific CSS/JS requirements

### Database Schema
Current tables:
- `users`: User accounts (id, username, email, password_hash, timestamps)
- `sessions`: User sessions (id, user_id, session_token, expires_at)
- `settings`: Application settings (id, key, value, timestamps)

## Architecture Benefits

### **Scalability**
- **Modular Design**: Clear separation of concerns
- **Database Ready**: SQLite for development, easily upgradeable to PostgreSQL
- **API First**: RESTful API design for future mobile/SPA integration

### **Maintainability**
- **Go Standards**: Following Go project layout conventions
- **Banbot Pattern**: Consistent with existing successful projects
- **Clean Dependencies**: Minimal external dependencies

### **Performance**
- **Fiber Framework**: High-performance web framework
- **Static Serving**: Efficient asset delivery
- **Compiled Binary**: Single executable deployment

## Next Steps

1. **User Authentication**: Implement JWT-based auth system
2. **Database Migration**: Add proper migration system
3. **API Expansion**: Add CRUD operations for business logic
4. **Frontend Enhancement**: Add interactive features to landing page
5. **Monitoring**: Add logging and metrics collection

The Sachi project now provides a solid foundation for building a comprehensive AI analytics platform while maintaining the proven architectural patterns from banbot.
