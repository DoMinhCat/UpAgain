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
  action: string;
  item_title: string;
  item_price: number;
  amount: number;
  id_transaction: string;
}

export interface UserInvoicesResponse {
  id_account: number;
  username: string;
  email: string;
  invoices: UserInvoice[];
  total: number;
}