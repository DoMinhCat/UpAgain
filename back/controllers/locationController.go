package controllers

import (
	"backend/models"
	"backend/utils"
	"backend/utils/geocode"
	"fmt"
	"log/slog"
	"net/http"
)

// GetAddressFromCoor godoc
// @Summary      Get address from coordinates
// @Description  Reverse geocoding: get address details (street, city, etc.) from latitude and longitude.
// @Tags         location
// @Security     ApiKeyAuth
// @Produce      json
// @Param        lat  query     number  true  "Latitude"
// @Param        lng  query     number  true  "Longitude"
// @Success      200  {object}  models.Address  "Address details"
// @Failure      400  {object}  nil             "Missing or invalid coordinates"
// @Failure      500  {object}  nil             "Internal server error"
// @Router       /location/address/ [get]
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
	if params.Lng > 180 || params.Lng < -180 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude")
		return
	}

	address, err := geocode.CoorToAddress(params)
	if err != nil {
		slog.Error("CoorToAddress() failed", "controller", "GetAddressFromCoor", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve address from given coordinates")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, address)
}

// GetCoorFromAddress godoc
// @Summary      Get coordinates from address
// @Description  Geocoding: get latitude and longitude from address details (street, postal code, city).
// @Tags         location
// @Security     ApiKeyAuth
// @Produce      json
// @Param        street       query     string  true  "Street name"
// @Param        postal_code  query     string  true  "Postal code"
// @Param        city         query     string  true  "City name"
// @Success      200          {object}  models.Coordinates  "Coordinates"
// @Failure      400          {object}  nil                 "Invalid address"
// @Failure      500          {object}  nil                 "Internal server error"
// @Router       /location/coordinates/ [get]
func GetCoorFromAddress(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	street := query.Get("street")
	postal_code := query.Get("postal_code")
	city := query.Get("city")

	// validate
	if street == "" || postal_code == "" || city == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid address")
		return
	}

	params := models.Address{
		Street:     street,
		PostalCode: postal_code,
		City:       city,
	}

	coordinates, err := geocode.AddressToCoor(params)
	if err != nil {
		slog.Error("AddressToCoor() failed", "controller", "GetCoorFromAddress", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve coordinates from given address")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, coordinates)
}
