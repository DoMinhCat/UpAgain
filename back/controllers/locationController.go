package

import (
	"log/slog"
	"net/http"
	"backend/models"
	"backend/utils/location"
	"encoding/json"
)

func GetAddressFromCoor(w http.ResponseWriter, r *http.Request) {
	// get params

	var coordinates models.Coordinates
	// bind params to coordinates

	// Call to utils 
	address, err := location.CoorToAddress(coordinates)
	if err != nil{

	}

}

func GetCoorFromAddress(w http.ResponseWriter, r *http.Request) {
	// get params
	var address models.Address
	// bind params to address



	// Call to utils 
	coordinates, err := location.AddressToCoor(address)
	if err != nil{
		
	}

}
