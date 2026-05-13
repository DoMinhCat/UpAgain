package geocode

import (
	"backend/config"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

// see docs for Geocode API here: https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding?hl=en
var geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json" // add param "?params..."
var defaultResponseLang = "fr"


// Send GET request to geocode API and return Address
func CoorToAddress(coor models.Coordinates) (models.Address, error) {
	// TODO: send GET request to geocodeBaseUrl with params
	
}

// Send GET request to geocode API and return Coordinates
func AddressToCoor(address models.Address) (models.Coordinates, error) {
	// build GET request with params
	payload := fmt.Sprintf("%s, %s %s", address.Street, address.PostalCode, address.City)
	params := url.Values{}
	params.Add("address", payload)
	params.Add("key", config.GeoCodeAPIKey)
	params.Add("language", defaultResponseLang)

	fullUrl := fmt.Sprintf("%s?%s", geocodeBaseUrl, params.Encode())
	req, err := http.NewRequest("GET", fullUrl, nil)
	if err != nil {
		return models.Coordinates{}, fmt.Errorf("AddressToCoor() HTTP request failed: %w", err)
	}

	// send GET request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return  models.Coordinates{}, fmt.Errorf("AddressToCoor() HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// decode response
	var geoResponse models.GeocodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoResponse); err != nil {
		return  models.Coordinates{}, fmt.Errorf("failed to decode json: %w", err)
	}

	if geoResponse.Status != "OK" {
		return  models.Coordinates{}, fmt.Errorf("geocode api error: %s", geoResponse.Status)
	}

	// get the first result (usually the most accurate)
	var bestResult models.GeocodeResult
	if len(geoResponse.Results) > 0 {
		bestResult = geoResponse.Results[0]
	} else {
		// no result found
		return models.Coordinates{}, nil
	}

	var response = models.Coordinates{
		Lat:          bestResult.Geometry.Location.Lat,
		Lng:          bestResult.Geometry.Location.Lng,
	}
	return response, nil
}