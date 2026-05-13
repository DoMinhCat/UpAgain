package controllers

import (
	"backend/models"
	"backend/utils/location"
	"net/http"
)

func GetAddressFromCoor(w http.ResponseWriter, r *http.Request) {
	// get params: lat, lng

	var coordinates models.Coordinates
	// bind params to coordinates

	// Call to utils 
	address, err := location.CoorToAddress(coordinates)
	if err != nil{

	}

}

func GetCoorFromAddress(w http.ResponseWriter, r *http.Request) {
	// get params: street, postal_code, city
	var address models.Address
	// bind params to address



	// Call to utils 
	coordinates, err := location.AddressToCoor(address)
	if err != nil{
		
	}

}
