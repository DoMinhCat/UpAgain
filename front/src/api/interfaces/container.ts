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
