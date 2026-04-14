export interface Subscription {
  id: number;
  is_trial: boolean;
  is_active: boolean;
  sub_from: string;
  sub_to: string;
  id_pro: number;
  cancel_reason?: string;
  username: string;
  avatar: string;
}

export interface SubscriptionListPagination {
  subscriptions: Subscription[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}