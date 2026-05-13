package controllers

import (
	"backend/models"
	"backend/utils"
	"backend/utils/geocode"
	"fmt"
	"net/http"
)

func GetAddressFromCoor(w http.ResponseWriter, r *http.Request) {
	// get params: lat, lng from query
	query := r.URL.Query()
	latStr := query.Get("lat")
	lngStr := query.Get("lng")

	// validate
	if latStr == "" || lngStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing latitude or longitude")
		return
	}

	// convert to float
	var params models.Coordinates
	_, err := fmt.Sscanf(latStr, "%f", &params.Lat)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid latitude format")
		return
	}
	_, err = fmt.Sscanf(lngStr, "%f", &params.Lng)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude format")
		return
	}

	if params.Lat > 90 || params.Lat < -90 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid latitude")
		return
	}
	if params.Lng > 90 || params.Lng < -90 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude")
		return
	}

	address, err := geocode.CoorToAddress(params)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve address from given coordinates")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, address)
}

func GetCoorFromAddress(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	street := query.Get("street")
	postal_code := query.Get("postal_code")
	city := query.Get("city")

	// validate
	if street == "" || postal_code == "" || city == ""{
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid address")
		return
	}

	params := models.Address{
		Street: street,
		PostalCode: postal_code,
		City: city,
	}

	coordinates, err := geocode.AddressToCoor(params)
	if err != nil{
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve coordinates from given address")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, coordinates)
}
