# Sachi - AI-Powered Analytics Platform

## Project Overview

Sachi is an AI-powered analytics platform built with a Go backend and a web-based user interface. The project follows the "banbot" architectural pattern, which emphasizes a modular and scalable design. The backend is powered by the high-performance Fiber web framework, and it uses SQLite for its database. The application operates in two modes: a web UI mode for user interaction and a command-line interface (CLI) for administrative tasks.

## Building and Running

### Prerequisites

*   Go 1.23+

### Instructions

1.  **Install Dependencies:**
    ```bash
    go mod tidy
    ```

2.  **Build the Application:**
    ```bash
    go build -o sachi
    ```

3.  **Run the Application:**

    *   **Web UI Mode (default):**
        ```bash
        ./sachi
        ```
        You can also specify the port and host:
        ```bash
        ./sachi web --port 3000 --host localhost
        ```

    *   **CLI Mode:**
        ```bash
        ./sachi version
        ./sachi help
        ```

### Docker

You can also run the application using Docker:

1.  **Using docker-compose:**
    ```bash
    cd docker
    docker-compose up
    ```

2.  **Direct Docker build:**
    ```bash
    docker build -f docker/Dockerfile -t sachi .
    docker run -p 8000:8000 sachi
    ```

## Development Conventions

*   **Project Structure:** The project follows a modular structure with clear separation of concerns:
    *   `main.go`: Application entry point
    *   `config/`: Configuration management
    *   `core/`: Core application logic
    *   `docker/`: Docker configuration
    *   `entry/`: CLI and startup logic
    *   `orm/`: Database models and logic
    *   `utils/`: Utility functions
    *   `web/`: Web layer, including static assets
*   **Frontend Assets:** All HTML, CSS, and JavaScript files are located in the `web/static/` directory.
*   **API Routes:** New API routes should be added in `web/dev/main.go`.
*   **Database Models:** Database tables are defined in `orm/db.go`.
*   **Configuration:** Application configuration can be modified in `config/config.go`.
