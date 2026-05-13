export interface Coordinates {
  latitude: string;
  longitude: string;
}

export interface Address {
  street: string;
  postal_code: string;
  city: string;
}

// Geocode API's nested JSON response
export interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

export interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
  location_type: string;
  viewport: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}
// End of Geocode API's nested JSON response
