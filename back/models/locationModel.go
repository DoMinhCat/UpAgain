package models

type Coordinates struct {
	Lat float64 `json:"latitude"`
	Lng float64 `json:"longitude"`
}

// This one is what we return to fronend / what we will insert into db
type Address struct {
	Street     string `json:"street"`      // 21 rue Erard
	PostalCode string `json:"postal_code"` // 75015
	City       string `json:"city"`        // Paris
}

/*
Start of nested JSON struct mapping for Geocode API response
example:
{
    "results": [
        {
            "address_components": [
                {
                    "long_name": "21",
                    "short_name": "21",
                    "types": [
                        "street_number"
                    ]
                },
                {
                    "long_name": "Rue Erard",
                    "short_name": "Rue Erard",
                    "types": [
                        "route"
                    ]
                },
                {
                    "long_name": "Paris",
                    "short_name": "Paris",
                    "types": [
                        "locality",
                        "political"
                    ]
                },
                {
                    "long_name": "Paris",
                    "short_name": "Paris",
                    "types": [
                        "administrative_area_level_2",
                        "political"
                    ]
                },
                {
                    "long_name": "Île-de-France",
                    "short_name": "IDF",
                    "types": [
                        "administrative_area_level_1",
                        "political"
                    ]
                },
                {
                    "long_name": "France",
                    "short_name": "FR",
                    "types": [
                        "country",
                        "political"
                    ]
                },
                {
                    "long_name": "75012",
                    "short_name": "75012",
                    "types": [
                        "postal_code"
                    ]
                }
            ],
            "formatted_address": "21 Rue Erard, 75012 Paris, France",
            "geometry": {
                "location": {
                    "lat": 48.8461315,
                    "lng": 2.3854732
                },
                "location_type": "ROOFTOP",
                "viewport": {
                    "northeast": {
                        "lat": 48.8474583802915,
                        "lng": 2.386930130291502
                    },
                    "southwest": {
                        "lat": 48.8447604197085,
                        "lng": 2.384232169708498
                    }
                }
            },
            "navigation_points": [
                {
                    "location": {
                        "latitude": 48.8461183,
                        "longitude": 2.3856301
                    }
                }
            ],
            "place_id": "ChIJ1TJ7nA1y5kcRSFpHbLXG_uc",
            "types": [
                "street_address",
                "subpremise"
            ]
        }
    ],
    "status": "OK"
}
*/

type GeocodeResponse struct {
	Results []GeocodeResult `json:"results"`
	Status  string          `json:"status"`
}

type GeocodeResult struct {
	AddressComponents []AddressComponent `json:"address_components"`
	FormattedAddress  string             `json:"formatted_address"`
	Geometry          Geometry           `json:"geometry"`
	PlaceID           string             `json:"place_id"`
	Types             []string           `json:"types"`
}

type AddressComponent struct {
	LongName  string   `json:"long_name"`
	ShortName string   `json:"short_name"`
	Types     []string `json:"types"`
}

type Geometry struct {
	Location     LatLng `json:"location"`
	LocationType string `json:"location_type"`
}

type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
