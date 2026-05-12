package models

type Coordinates struct {
	Lat string `json:"latitude"`
	Lng string `json:"longitude"`
}

type GeoCodeResponse struct {
	// TODO: see response example here https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-reverse-geocoding?hl=en
	// Try call Postman to see a real example response json

}

// This one is what we return to fronend / what we will insert into db
type Address struct {
	Street string `json:"street"`  // 21 rue Erard
	PostalCode string `json:"postal_code"` // 75015
	City string `json:"city"` // Paris
}