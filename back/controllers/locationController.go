package

import (
	"log/slog"
	"net/http"
	"backend/models"
	"backend/utils/location"
	"encoding/json"
)

func GetAddressFromCoor(w http.ResponseWriter, r *http.Request) {
	var coordinates models.Coordinates
	if err := json.NewDecoder(r.Body).Decode(&coordinates); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid coordinates.")
		return
	}

	// Call to utils 
	address, err := location.CoorToAddress(coordinates)
	if err != nil{

	}

}

func GetCoorFromAddress(w http.ResponseWriter, r *http.Request) {
	var address models.Address
	if err := json.NewDecoder(r.Body).Decode(&address); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid address.")
		return
	}

	// Call to utils 
	coordinates, err := location.AddressToCoor(address)
	if err != nil{
		
	}

}
