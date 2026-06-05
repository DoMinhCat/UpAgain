package utils

import (
	"database/sql"
	"log"
	"os"
)

func SetUpDbConn() *sql.DB {
	driver := "postgres"
	uri := os.Getenv("SEED_DB_URL")
	if uri == "" {
		log.Panic("SEED_DB_URL not find in .env")
	}

	conn, err := sql.Open(driver, uri)
	if err != nil {
		log.Panic("failed to connect to database", "error", err)
	}
	return conn
}