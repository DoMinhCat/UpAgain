export interface Deposit {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  created_at: string;
  id_container: number;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
}

export interface PaginatedDepositsResponse {
  deposits: Deposit[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface DepositDetails {
  container_id: number;
}
