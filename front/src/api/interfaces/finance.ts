export interface RevenueMonthData {
  month: string; // "YYYY-MM"
  subscriptions: number;
  commissions: number;
  ads: number;
  events: number;
}

export interface RevenueSummary {
  total_subscriptions: number;
  total_commissions: number;
  total_ads: number;
  total_events: number;
  grand_total: number;
}

export interface RevenueResponse {
  year: number;
  data: RevenueMonthData[];
  summary: RevenueSummary;
}

export interface FinanceSetting {
  key: string;
  value: number;
  updated_at: string;
}

export interface InvoiceUser {
  id_account: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  transaction_count: number;
  total_spent: number;
}

export interface InvoicesListResponse {
  users: InvoiceUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UserInvoice {
  id: number;
  created_at: string;
  type: "transaction" | "subscription" | "ad" | "event";
  amount: number; // total paid

  // Transaction-specific
  id_transaction?: string;
  item_title?: string;
  item_price?: number;
  commission?: number;

  // Subscription-specific
  sub_from?: string;
  sub_to?: string;

  // Ad-specific
  ad_start_date?: string;
  ad_end_date?: string;
  post_id?: number;
  post_title?: string;

  // Event-specific
  event_id?: number;
  event_title?: string;
}

export interface UserInvoicesResponse {
  id_account: number;
  username: string;
  email: string;
  invoices: UserInvoice[];
  total: number;
}
