package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	Port       string
	CheckIntervalSeconds string // seconds between health checks
}

func Load() *Config {
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	return &Config{
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "password"),
		DBName:        getEnv("DB_NAME", "webpulse"),
		Port:          getEnv("PORT", "8080"),
		CheckIntervalSeconds: getEnv("CHECK_INTERVAL_SECONDS", "30"),
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
