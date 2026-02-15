package controller

import (
	"backend/utils"
	"fmt"
	"net/http"
)

func HealthCheck(res http.ResponseWriter, req *http.Request) {
	err := utils.Conn.Ping()
	if err != nil {
		fmt.Fprintf(res, "Error connecting to database: %v", err)
	} else{
		var result = "Database connected successfully"
		fmt.Fprintf(res, "%s", result)
	}
}