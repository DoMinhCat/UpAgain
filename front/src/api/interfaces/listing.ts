export interface Listing {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  price: number | null;
  created_at: string;
  street: string;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
  lat: number;
  lng: number;
}

export interface PaginatedListingsResponse {
  listings: Listing[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface ListingDetails {
  street: string;
  city: string;
  postal_code: string;
  lat: number;
  lng: number;
}
