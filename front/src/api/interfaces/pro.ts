export interface MaterialInventoryStats {
  material: string;
  available: number;
  added: number;
  recycled: number;
}

export interface MaterialUsageStats {
  material: string;
  weight: number;
}

export interface ProAnalyticsResponse {
  inventory: MaterialInventoryStats[];
  impact: {
    total_co2: number;
    material_usage: MaterialUsageStats[];
  };
  finance: {
    total_purchases: number;
    paid_purchases: number;
    total_spent: number;
  };
}
