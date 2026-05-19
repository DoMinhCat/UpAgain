export interface Item {
  created_at: string;
  id: number;
  title: string;
  description: string;
  weight: number;
  state: string;
  id_user: number;
  username: string;
  creator_avatar?: string;
  category: string; // listing or deposit
  material: string;
  price: number;
  status: string;
  images?: string[];
  street?: string;
  score: number;
  refuse_reason?: string;
}

export interface ItemsListPagination {
  items: Item[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface ItemAdminStats {
  new_since: number;
  active: number;
  pending: number;
  new_transactions_since: number;
  total_transactions: number;
  // chart data
  total_wood: number;
  total_metal: number;
  total_textile: number;
  total_glass: number;
  total_plastic: number;
  total_other: number;
  total_mixed: number;
  total_listings: number;
  total_deposits: number;
}

export interface PaginatedHistoryResponse {
  items: Item[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface CreateItemRequest {
  title: string;
  description: string;
  price: number;
  weight: number;
  material: string;
  state: string;
  category: string; // listing or deposit
  images: File[];
  id_user: number;
  listing_info?: CreateListingRequest;
  deposit_info?: CreateDepositRequest;
}

export interface CreateDepositRequest {
  id_item: number;
  id_container: number;
}

export interface CreateListingRequest {
  id_item: number;
  street: string;
  city_name: string;
  postal_code: string;
}

export interface ItemPurchaseResponse {
  checkout_url: string;
}

export interface ItemPurchasePayload {
  origin_url?: string;
  paid?: boolean;
}
