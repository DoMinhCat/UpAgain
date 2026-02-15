package utils

// Connection to DB

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

var Conn *sql.DB
var ErrDb error

func GetDb() (*sql.DB, error){
	var connString = GetDbUrl()
	var driver = GetDbDriver()
	conn, err := sql.Open(driver, connString)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %v",err)
	}

	return conn, nil
}