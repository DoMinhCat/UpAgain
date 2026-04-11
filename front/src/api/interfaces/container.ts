export interface Container {
  id: number;
  created_at: string;
  city_name: string;
  postal_code: string;
  status: "ready" | "occupied" | "maintenance";
  is_deleted: boolean;
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
