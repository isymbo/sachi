# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o sachi .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /app/sachi .

# Copy static files to web/static
COPY --from=builder /app/web/static ./web/static/

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8000
ENV DATA_DIR=/app/data

# Run the application
CMD ["./sachi", "web", "--host", "0.0.0.0", "--port", "8000", "--datadir", "/app/data"]
