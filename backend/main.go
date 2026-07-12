package main

import (
	"log"
	"webpulse/config"
	"webpulse/database"
	"webpulse/middleware"
	"webpulse/routes"
	"webpulse/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	database.Connect(cfg)

	// Start background monitoring engine
	monitor := services.NewMonitorService(cfg.CheckIntervalSeconds)
	monitor.Start()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	routes.Register(r)

	log.Printf("🚀 WebPulse backend running on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
