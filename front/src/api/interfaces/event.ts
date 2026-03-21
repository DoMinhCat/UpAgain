// uing "AppEvent" because "Event" is reserved
export interface AppEvent {
  id: number;
  created_at: string;
  title: string;
  description: string;
  start_at: string;
  price: number;
  category: string;
  capacity: number;
  status: string;
  city: string;
  street: string;
  location_detail: string;
  employee_name: string | null;
}

export interface EventsListPagination {
  events: AppEvent[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface EventStats {
  total: number;
  increase: number;
  upcoming: number;
  registrations: number;
  pending: number;
}

export interface EventCreationPayload {
  title: string;
  description: string;
  start_at: string;
  price: number;
  category: string;
  capacity?: number;
  city: string;
  street: string;
  location_detail?: string;
  status: string;
}

export interface AssignedEmployee {
  id: number;
  username: string;
  assigned_at: string;
}
