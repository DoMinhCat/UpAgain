export interface Container {
  id: number;
  created_at: string;
  city_name: string;
  postal_code: string;
  status: "ready" | "occupied" | "maintenance";
  is_deleted: boolean;
  current_deposit_id: number | null;
  current_deposit_title: string | null;
}

export interface ContainerCountStats {
  active: number;
  total: number;
}

export interface ContainerListPagination {
  containers: Container[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}
