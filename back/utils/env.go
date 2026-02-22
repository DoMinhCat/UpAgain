package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv(){
	err := godotenv.Load()
	if err!=nil{
		log.Panic("Error getting env: ", err)
	}
}

func GetDbUrl() string{
	uri := os.Getenv("DB_URL")
	if uri==""{
		log.Panic("DB_URL not find in .env")
	}
	return uri
}

func GetDbDriver() string{
	driver := os.Getenv("DB_DRIVER")
	if driver==""{
		log.Panic("DB_DRIVER not find in .env")
	}
	return driver
}

func GetPort() string{
	port := os.Getenv("PORT")
	if port==""{
		port="8080"
	}
	return port
}

func GetJWTSecret() []byte{
	secret := os.Getenv("JWT_SECRET")
	if secret==""{
		log.Panic("JWT_SECRET not find in .env")
	}
	return []byte(secret)
}

func GetFrontOriginDev() string{
	frontOrigin := os.Getenv("FRONTEND_ORIGIN_DEV")
	if frontOrigin==""{
		log.Panic("FRONTEND_ORIGIN_DEV not find in .env")
	}
	return frontOrigin
}

func GetFrontOriginProd() string{
	frontOrigin := os.Getenv("FRONTEND_ORIGIN_PROD")
	if frontOrigin==""{
		log.Panic("FRONTEND_ORIGIN_PROD not find in .env")
	}
	return frontOrigin
}