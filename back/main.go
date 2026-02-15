package main

import (
	"backend/controller"
	"backend/utils"
	"fmt"
	"net/http"
)

func main(){
	utils.LoadEnv()
	utils.Conn, utils.ErrDb = utils.GetDb()
	defer utils.Conn.Close()

	http.HandleFunc("GET /healthcheck/{$}", controller.HealthCheck)

	// back office
	//http.HandleFunc("GET /admin/{$}", controller.HealthCheck)

	// user
	//http.HandleFunc("GET /user/{$}", controller.HealthCheck)

	// employee
	//http.HandleFunc("GET /employee/{$}", controller.HealthCheck)
	
	// pro
	//http.HandleFunc("GET /pro/{$}", controller.HealthCheck)


	fmt.Println("Listening at : http://localhost:8080/")
	http.ListenAndServe(":8080", nil)
}
