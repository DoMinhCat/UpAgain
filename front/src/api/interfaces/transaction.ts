// Keyword Transaction is reserved in TypeScript
export interface Transaction {
  id: number;
  id_transaction: string;
  created_at: string;
  action: string;
  id_item: number;
  id_pro: number;
  username_pro: string;
}

export interface TransactionsPagination {
  total_transactions: number;
  transactions: Transaction[];
  current_page: number;
  last_page: number;
  limit: number;
}
