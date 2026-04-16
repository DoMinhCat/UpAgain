package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv(env string) {
	if env != "dev" && env != "prod" {
		log.Panicf("Invalid env: %s. Must be 'dev' or 'prod'", env)
	}
	err := godotenv.Load(".env_" + env)
	if err != nil {
		log.Panicf("Error getting env: %v", err)
	}
}

func GetDbUrl() string {
	uri := os.Getenv("DB_URL")
	if uri == "" {
		log.Panic("DB_URL not find in .env")
	}
	return uri
}

func GetDbDriver() string {
	driver := os.Getenv("DB_DRIVER")
	if driver == "" {
		log.Panic("DB_DRIVER not find in .env")
	}
	return driver
}

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		log.Panic("PORT not find in .env")
	}
	return port
}

func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Panic("JWT_SECRET not find in .env")
	}
	return []byte(secret)
}

func GetFrontOrigin() string {
	frontOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontOrigin == "" {
		log.Panic("FRONTEND_ORIGIN not find in .env")
	}
	return frontOrigin
}