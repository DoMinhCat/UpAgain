package utils

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func LoadEnv(env string) {
	if env != "dev" && env != "prod" && env != "production" && env != "development" {
		log.Panicf("Invalid env: %s. Must be 'dev', 'prod', 'production' or 'development'", env)
	}

	// Try loading from .env.production or .env.development first
	var envFile string
	if env == "dev" || env == "development" {
		envFile = ".env.development"
	} else {
		envFile = ".env.production"
	}

	godotenv.Load(envFile)

	// Always try loading from the root .env or environment variables as fallback
	godotenv.Load(".env")
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

func GetStripeSecretKey() string {
	secret := os.Getenv("STRIPE_SECRET_API_KEY")
	if secret == "" {
		log.Panic("STRIPE_SECRET_API_KEY not find in .env")
	}
	return secret
}

func GetOnesignalRestApiKey() string {
	key := os.Getenv("ONESIGNAL_REST_API_KEY")
	if key == "" {
		// Fallback to ONESIGNAL_API_KEY if REST_API_KEY is missing
		key = os.Getenv("ONESIGNAL_API_KEY")
		if key == "" {
			log.Panic("ONESIGNAL_REST_API_KEY not find in .env")
		}
	}
	return key
}

func GetOnesignalAppId() string {
	id := os.Getenv("ONESIGNAL_APP_ID")
	if id == "" {
		log.Panic("ONESIGNAL_APP_ID not find in .env")
	}
	return id
}

func GetGeoCodeApiKey() string {
	key := os.Getenv("GEOCODE_API_KEY")
	if key == "" {
		log.Panic("GEOCODE_API_KEY not find in .env")
	}
	return key
}

func GetGeminiApiKey() string {
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		log.Panic("GEMINI_API_KEY not find in .env")
	}
	return key
}

func GetSmtpHost() string {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		log.Panic("SMTP_HOST not find in .env")
	}
	return host
}

func GetSmtpPort() int {
	portStr := os.Getenv("SMTP_PORT")
	if portStr == "" {
		log.Panic("SMTP_PORT not find in .env")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Panicf("SMTP_PORT is not a valid integer: %s", portStr)
	}
	return port
}

func GetSmtpUser() string {
	user := os.Getenv("SMTP_USER")
	if user == "" {
		log.Panic("SMTP_USER not find in .env")
	}
	return user
}

func GetSmtpPassword() string {
	password := os.Getenv("SMTP_PASSWORD")
	if password == "" {
		log.Panic("SMTP_PASSWORD not find in .env")
	}
	return password
}

func GetSmtpFrom() string {
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		log.Panic("SMTP_FROM not find in .env")
	}
	return from
}

func GetBackendOrigin() string {
	origin := os.Getenv("BACKEND_ORIGIN")
	if origin == "" {
		log.Panic("BACKEND_ORIGIN not find in .env")
	}
	return origin
}
