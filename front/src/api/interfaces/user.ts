export interface TotalScore {
  total: number;
  co2: number;
}

export interface UserImpactStats {
  co2: number;
  water: number;
  electricity: number;
}

export interface UserImpactItem {
  id: number;
  title: string;
  material: string;
  weight: number;
  price: number;
  images: string[];
  sold_date: string;
  buyer_name: string;
  co2: number;
  water: number;
  electricity: number;
}

export interface GlobalImpactStats {
  co2: number;
  water: number;
  electricity: number;
}

export interface UserImpactItemsPagination {
  items: UserImpactItem[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}
