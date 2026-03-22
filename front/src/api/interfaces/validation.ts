export interface ValidationStats {
  pending_deposits: number;
  approved_deposits: number;
  refused_deposits: number;
  pending_listings: number;
  approved_listings: number;
  refused_listings: number;
  pending_events: number;
  approved_events: number;
  refused_events: number;
}

export interface ValidationFilters {
  search?: string;
  sort?: string;
  status?: string;
  type?: string;
}
