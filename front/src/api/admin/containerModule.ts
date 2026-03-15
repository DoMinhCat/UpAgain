import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
export interface Container {
id: number;
created_at: string;
city_name: string;
postal_code: string;
status: 'ready' | 'occupied' | 'maintenance';
is_deleted: boolean;
}

export const getAllContainers = async (): Promise<Container[]> => {
  const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS);
  return response.data;
};

export const createContainer = async (container: Partial<Container>) => {
  const response = await api.post(ENDPOINTS.ADMIN.CONTAINERS, container);
  return response.data;
};

export const updateContainerStatus = async (id: number, status: string) => {
  const response = await api.put(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`, { status });
  return response.data;
};

export const deleteContainer = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`);
  return response;
};

export const getContainerDetails = async (id: number): Promise<Container> => {
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`);
  return response.data;
};