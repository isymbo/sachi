package dev

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/isymbo/sachi/config"
	"github.com/isymbo/sachi/core"
	"github.com/isymbo/sachi/orm"
	"golang.org/x/crypto/bcrypt"
)

// Run starts the development web server
func Run(args *config.CmdArgs) error {
	// Initialize database
	err := orm.Init(args.DBFile)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %v", err)
	}

	// Initial session cleanup to avoid bloating queries
	_ = orm.CleanupExpiredSessions()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Sachi",
		ErrorHandler: errorHandler,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "*",
	}))

	// Enable ETag for client-side caching and gzip compression for smaller payloads
	app.Use(etag.New())
	app.Use(compress.New(compress.Config{Level: compress.LevelDefault}))

	if args.LogLevel == "debug" {
		app.Use(logger.New())
	}

	// API routes
	api := app.Group("/api")
	setupAPIRoutes(api)

	// Auth routes
	auth := app.Group("/api")
	setupAuthRoutes(auth)

	// Home route - marketing page for guests, profile for authenticated users
	app.Get("/", handleHome)

	// Auth-protected profile routes
	app.Get("/profile", requireAuth, func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "no-store")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.SendFile("./web/static/profile.html")
	})
	app.Get("/profile.html", requireAuth, func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "no-store")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.SendFile("./web/static/profile.html")
	})

	// Public HTML routes
	app.Get("/index.html", func(c *fiber.Ctx) error {
		return c.SendFile("./web/static/index.html")
	})
	app.Get("/login.html", func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "no-store")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.SendFile("./web/static/login.html")
	})
	app.Get("/register.html", func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "no-store")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.SendFile("./web/static/register.html")
	})
	app.Get("/product.html", func(c *fiber.Ctx) error {
		return c.SendFile("./web/static/product.html")
	})
	app.Get("/pricing.html", func(c *fiber.Ctx) error {
		return c.SendFile("./web/static/pricing.html")
	})
	app.Get("/about.html", func(c *fiber.Ctx) error {
		return c.SendFile("./web/static/about.html")
	})

	// Set aggressive cache headers for static assets (fingerprint if file names change)
	app.Use(func(c *fiber.Ctx) error {
		p := c.Path()
		if strings.HasPrefix(p, "/css/") || strings.HasPrefix(p, "/js/") || strings.HasPrefix(p, "/images/") || strings.HasPrefix(p, "/fonts/") {
			c.Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		return c.Next()
	})

	// Serve static files from web/static directory (CSS, JS, images, etc.)
	app.Static("/css", "./web/static/css")
	app.Static("/js", "./web/static/js")
	app.Static("/images", "./web/static/images")
	app.Static("/fonts", "./web/static/fonts")

	// Fallback: serve .html files from ./web/static for any unmatched routes
	app.Use(func(c *fiber.Ctx) error {
		path := c.Path()
		if strings.HasSuffix(path, ".html") {
			// Protected profile.html -> redirect to /profile to enforce auth middleware
			if path == "/profile.html" {
				return c.Redirect("/profile")
			}
			return c.SendFile("./web/static" + path)
		}
		return fiber.ErrNotFound
	})

	// Start periodic session cleanup (every hour)
	go func() {
		ticker := time.NewTicker(time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := orm.CleanupExpiredSessions(); err != nil {
				log.Printf("session cleanup error: %v", err)
			}
		}
	}()

	// Start server
	addr := fmt.Sprintf("%s:%d", args.Host, args.Port)
	log.Printf("Sachi web server starting at http://%s", addr)

	// Register cleanup callback
	core.AddExitCallback(func() {
		if err := app.Shutdown(); err != nil {
			log.Printf("Error shutting down server: %v", err)
		}
	})

	return app.Listen(addr)
}

// errorHandler handles Fiber errors
func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": err.Error(),
	})
}

// setupAPIRoutes sets up API routes
func setupAPIRoutes(api fiber.Router) {
	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"version": core.Version,
		})
	})

	// Info endpoint
	api.Get("/info", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name":        "Sachi",
			"description": "AI-Powered Analytics Platform",
			"version":     core.Version,
			"mode":        "development",
		})
	})

	// Static assets info (for backward compatibility)
	api.Get("/assets", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"css": "/css/styles.css",
			"js":  "/js/main.js",
			"pages": []string{
				"/",
				"/product.html",
				"/pricing.html",
				"/about.html",
				"/login.html",
				"/register.html",
				"/profile.html",
			},
			"static_root": "/web/static",
		})
	})
}

// setupAuthRoutes sets up authentication routes
func setupAuthRoutes(auth fiber.Router) {
	auth.Post("/register", handleRegister)
	auth.Post("/login", handleLogin)
	auth.Post("/logout", handleLogout)
	auth.Get("/me", requireAuth, handleMe)
	auth.Put("/profile", requireAuth, handleUpdateProfile)
	auth.Post("/change-password", requireAuth, handleChangePassword)
}

// requireAuth middleware to protect routes
func requireAuth(c *fiber.Ctx) error {
	sessionToken := c.Cookies("session_token")
	if sessionToken == "" {
		return c.Status(401).JSON(fiber.Map{
			"error":   true,
			"message": "Authentication required",
		})
	}

	user, err := orm.ValidateSession(sessionToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid session",
		})
	}

	// Store user in context
	c.Locals("user", user)
	return c.Next()
}

type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Company  string `json:"company"`
	Password string `json:"password"`
}

func handleRegister(c *fiber.Ctx) error {
	user := new(User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Validate required fields
	if user.Name == "" || user.Email == "" || user.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Name, email, and password are required",
		})
	}

	// Check if user already exists
	existingUser, err := orm.GetUserByEmail(user.Email)
	if err == nil && existingUser != nil {
		return c.Status(409).JSON(fiber.Map{
			"error":   true,
			"message": "User with this email already exists",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to hash password",
		})
	}

	_, err = orm.CreateUser(user.Name, user.Email, user.Company, string(hashedPassword))
	if err != nil {
		// Handle duplicate email race condition
		if strings.Contains(err.Error(), "UNIQUE constraint failed: users.email") {
			return c.Status(409).JSON(fiber.Map{
				"error":   true,
				"message": "User with this email already exists",
			})
		}
		log.Printf("Error creating user: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": fmt.Sprintf("Failed to create user: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
	})
}

func handleLogin(c *fiber.Ctx) error {
	type LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Email and password are required",
		})
	}

	user, err := orm.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid email or password",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid email or password",
		})
	}

	// Create session
	sessionToken, err := orm.CreateSession(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create session",
		})
	}

	// Clear any old cookie set on /api path (from previous versions)
	c.Cookie(&fiber.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/api",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	// Set cookie for full site scope
	c.Cookie(&fiber.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"user": fiber.Map{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"company": user.Company,
		},
	})
}

func handleLogout(c *fiber.Ctx) error {
	sessionToken := c.Cookies("session_token")
	if sessionToken != "" {
		orm.DeleteSession(sessionToken)
	}

	// Clear the cookie
	c.Cookie(&fiber.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logged out successfully",
	})
}

func handleMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*orm.User)

	return c.JSON(fiber.Map{
		"success": true,
		"user": fiber.Map{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"company": user.Company,
		},
	})
}

func handleUpdateProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*orm.User)

	type UpdateProfileRequest struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Company string `json:"company"`
	}

	req := new(UpdateProfileRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Name and email are required",
		})
	}

	// Check if email is being changed and if it already exists
	if req.Email != user.Email {
		existingUser, err := orm.GetUserByEmail(req.Email)
		if err == nil && existingUser != nil {
			return c.Status(409).JSON(fiber.Map{
				"error":   true,
				"message": "Email already exists",
			})
		}
	}

	// Update user profile
	err := orm.UpdateUser(user.ID, req.Name, req.Email, req.Company)
	if err != nil {
		log.Printf("Error updating user profile: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update profile",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profile updated successfully",
	})
}

func handleChangePassword(c *fiber.Ctx) error {
	user := c.Locals("user").(*orm.User)

	type ChangePasswordRequest struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	req := new(ChangePasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Validate required fields
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Current and new password are required",
		})
	}

	// Validate current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error":   true,
			"message": "Current password is incorrect",
		})
	}

	// Validate new password length
	if len(req.NewPassword) < 6 {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "New password must be at least 6 characters long",
		})
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to hash new password",
		})
	}

	// Update password in database
	err = orm.UpdateUserPassword(user.ID, string(hashedPassword))
	if err != nil {
		log.Printf("Error updating user password: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update password",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password changed successfully",
	})
}

// handleHome redirects based on authentication status
func handleHome(c *fiber.Ctx) error {
	sessionToken := c.Cookies("session_token")
	if sessionToken == "" {
		return c.SendFile("./web/static/index.html")
	}
	if _, err := orm.ValidateSession(sessionToken); err != nil {
		return c.SendFile("./web/static/index.html")
	}
	return c.Redirect("/profile")
}
