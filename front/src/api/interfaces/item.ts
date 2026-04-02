export interface Item {
  created_at: string;
  id: number;
  title: string;
  description: string;
  weight: number;
  state: string;
  id_user: number;
  username: string;
  category: string;
  material: string;
  price: number;
  status: string;
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
}
