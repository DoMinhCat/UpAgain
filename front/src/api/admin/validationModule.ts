import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";


export interface PendingDeposit {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  created_at: string;
  id_container: number;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
}

export interface PendingListing {
  id_item: number;
  title: string;
  description: string;
  material: string;
  state: string;
  weight: number;
  price: number | null;
  created_at: string;
  city_name: string;
  postal_code: string;
  id_user: number;
  username: string;
}

export interface PendingEvent {
  id_event: number;
  title: string;
  description: string | null;
  category: string;
  date_start: string;
  time_start: string | null;
  capacity: number | null;
  price: number | null;
  created_at: string;
  id_employee: number;
  employee_username: string;
}

export interface PendingValidationsResponse {
  deposits: PendingDeposit[];
  listings: PendingListing[];
  events: PendingEvent[];
}

// --- REQUÊTES ---
export const fetchPendingValidations = async (): Promise<PendingValidationsResponse> => {
  const response = await api.get<PendingValidationsResponse>(ENDPOINTS.ADMIN.VALIDATIONS.PENDING);
  return response.data;
};


export const fetchAllItemsHistory = async () => {
  const response = await api.get(ENDPOINTS.ADMIN.VALIDATIONS.HISTORY);
  return response.data;
};

export const processValidationAction = async (
  entityType: 'listings' | 'deposits' | 'events',
  id: number,
  action: 'approve' | 'refuse',
  reason?: string
): Promise<{ message: string }> => {
  const payload = { action, reason: reason || "" };
  const url = ENDPOINTS.ADMIN.VALIDATIONS.ACTION(entityType, id);
  const response = await api.put(url, payload);
  return response.data;
};