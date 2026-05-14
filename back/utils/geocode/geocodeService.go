package geocode

import (
	"backend/config"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

// see docs for Geocode API here: https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding?hl=en
var geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json" // add param "?params..."
var defaultResponseLang = "fr"


// Send GET request to geocode API and return Address
func CoorToAddress(coor models.Coordinates) (models.Address, error) {
	// build GET request with params
	latlng := fmt.Sprintf("%f,%f", coor.Lat, coor.Lng)
	params := url.Values{}
	params.Add("latlng", latlng)
	params.Add("key", config.GeoCodeAPIKey)
	params.Add("language", defaultResponseLang)

	fullUrl := fmt.Sprintf("%s?%s", geocodeBaseUrl, params.Encode())
	req, err := http.NewRequest("GET", fullUrl, nil)
	if err != nil {
		return models.Address{}, fmt.Errorf("CoorToAddress() HTTP request failed: %w", err)
	}

	// send GET request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return models.Address{}, fmt.Errorf("CoorToAddress() HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// decode response
	var geoResponse models.GeocodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoResponse); err != nil {
		return models.Address{}, fmt.Errorf("failed to decode json: %w", err)
	}

	if geoResponse.Status != "OK" {
		return models.Address{}, fmt.Errorf("geocode api error: %s", geoResponse.Status)
	}

	// get the first result (usually the most accurate)
	var bestResult models.GeocodeResult
	if len(geoResponse.Results) > 0 {
		bestResult = geoResponse.Results[0]
	} else {
		// no result found
		return models.Address{}, nil
	}

	response := parseAddress(bestResult.AddressComponents) 
	return response, nil
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

// helper function to build Address from AddressComponent 
func parseAddress(components []models.AddressComponent) models.Address {
	// 1. Compose Street (number + route)
	streetNumber := getField(components, "street_number")
	route := getField(components, "route")
	
	fullStreet := ""
	if streetNumber != "" && route != "" {
		fullStreet = fmt.Sprintf("%s %s", streetNumber, route)
	} else {
		fullStreet = streetNumber + route // Fallback if one is missing
	}

	// 2. Resolve City (Priority: level_1, then level_2)
	level1 := getField(components, "administrative_area_level_1")
	level2 := getField(components, "administrative_area_level_2")
	
	var cityParts []string
	if level1 != "" {
		cityParts = append(cityParts, level1)
	}
	if level2 != "" {
		cityParts = append(cityParts, level2)
	}

	// Joins parts with ", " only if both exist, otherwise returns the one that does
	fullCity := strings.Join(cityParts, ", ")

	return models.Address{
		Street:     fullStreet,
		PostalCode: getField(components, "postal_code"),
		City:       fullCity,
	}
}

// helper function to extract fields from AddressComponent
func getField(components []models.AddressComponent, targetType string) string {
	for _, c := range components {
		for _, t := range c.Types {
			if t == targetType {
				return c.LongName
			}
		}
	}
	return ""
}