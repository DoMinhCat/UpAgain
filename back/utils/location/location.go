package location

import (
	"backend/config"
	"backend/models"
)

// see docs for Geocode API here: https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding?hl=en
var apikey = config.GeoCodeAPIKey
var geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json" // add param "?params..."

// functions calling to Geocode API

func CoorToAddress(coor models.Coordinates) (models.Address, error) {
	// TODO: send GET request to geocodeBaseUrl with params and parse response
}

func AddressToCoor(coor models.Address) (models.Coordinates, error) {
	// TODO: send GET request to geocodeBaseUrl with params and parse response
}