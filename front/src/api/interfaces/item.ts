export interface Item {
  id: number;
  title: string;
  status: string;
  created_at: string;
  username: string;
  item_type: string;
}

export interface PaginatedHistoryResponse {
  items: Item[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}
