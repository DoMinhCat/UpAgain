export interface Container {
  id: number;
  created_at: string;
  city_name: string;
  postal_code: string;
  street: string;
  status: "ready" | "occupied" | "maintenance" | "waiting";
  is_deleted: boolean;
  current_deposit_id: number | null;
  current_deposit_title: string | null;
}

export interface ContainerScheduleItem {
  deposit_id: number;
  deposit_title: string;
  valid_from: string;
  valid_to: string;
}

export interface ContainerSchedule {
  user_range: ContainerScheduleItem[];
  pro_range: ContainerScheduleItem[];
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
