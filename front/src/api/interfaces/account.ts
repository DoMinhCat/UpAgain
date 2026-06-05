export interface AccountCountStats {
  total: number;
  increase: number;
}

export interface updateAccountPayload {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface updateIsBannedPayload {
  id: number;
  is_banned: boolean;
}

export interface AccountStats {
  total_events?: number;
  total_posts?: number;
  total_deposits?: number;
  total_projects?: number;
  total_listings?: number;
  total_spendings?: number;
}

export interface updatePasswordPayload {
  id: number;
  newPassword: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  phone?: string;
  role: string;
  is_trial?: boolean;
  is_premium?: boolean;
  paid?: boolean;
  origin_url?: string;
}

export interface Account {
  id: number;
  username: string;
  email: string;
  role: string;
  is_banned: boolean;
  created_at: string;
  last_active: string;
  phone?: string;
  score?: number;
  is_premium?: boolean;
  is_trial?: boolean;
  avatar?: string;
  deleted_at?: string;
  completed_onboard?: boolean;
}

export interface AccountsListPagination {
  accounts: Account[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface UpgradePayload {
  is_trial: boolean;
  paid: boolean;
  origin_url?: string;
}

export interface UpgradeResponse {
  checkout_url?: string;
  message?: string;
}
