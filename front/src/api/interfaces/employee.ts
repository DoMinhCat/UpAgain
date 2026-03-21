export interface AvailableEmployeesRequest {
  start_at: string;
  end_at: string;
}

export interface AvailableEmployee {
  id: number;
  email: string;
  username: string;
}

export interface AvailableEmployeesResponse {
  employees: AvailableEmployee[];
}
