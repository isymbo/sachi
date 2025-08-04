package dev

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/isymbo/sachi/config"
	"github.com/isymbo/sachi/core"
	"github.com/isymbo/sachi/orm"
)

// Run starts the development web server
func Run(args *config.CmdArgs) error {
	// Initialize database
	err := orm.Init(args.DBFile)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %v", err)
	}

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

	if args.LogLevel == "debug" {
		app.Use(logger.New())
	}

	// Serve static files from web/static directory
	app.Static("/", "./web/static", fiber.Static{
		Index:  "index.html",
		Browse: false,
		MaxAge: 3600, // 1 hour cache for static assets
	})

	// API routes
	api := app.Group("/api")
	setupAPIRoutes(api)

	// Fallback to serve index.html for SPA routing (must be after API routes)
	app.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile("./web/static/index.html")
	})

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
			},
			"static_root": "/web/static",
		})
	})
}
