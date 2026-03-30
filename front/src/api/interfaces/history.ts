export interface AdminHistory {
  id: number;
  created_at: string;
  module: string;
  item_id: number;
  action: string;
  old_state: string;
  new_state: string;
  admin_id: number;
  admin_name: string;
}

export interface HistoryListPagination {
  histories: AdminHistory[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}
