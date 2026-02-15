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