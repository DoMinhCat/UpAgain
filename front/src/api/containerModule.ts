import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import {
  type Container,
  type ContainerCountStats,
  type ContainerListPagination,
} from "./interfaces/container";

export const getAllContainers = async (
  page: number = -1,
  limit: number = -1,
  search?: string,
  status?: string,
): Promise<ContainerListPagination> => {
  const params: Record<string, string | number> = {};
  if (page !== -1) params.page = page;
  if (limit !== -1) params.limit = limit;
  if (search) params.search = search;
  if (status) params.status = status;

  const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS.ALL, { params });
  return response.data;
};

export const createContainer = async (container: Partial<Container>) => {
  const response = await api.post(ENDPOINTS.ADMIN.CONTAINERS.ALL, container);
  return response.data;
};

export const updateContainerStatus = async (id: number, status: string) => {
  const response = await api.put(`${ENDPOINTS.ADMIN.CONTAINERS.ALL}${id}/`, {
    status,
  });
  return response.data;
};

export const deleteContainer = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.ADMIN.CONTAINERS.ALL}${id}/`);
  return response;
};

export const getContainerDetails = async (id: number): Promise<Container> => {
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS.ALL}${id}/`);
  return response.data;
};

export const getContainerCountStats =
  async (): Promise<ContainerCountStats> => {
    const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS.COUNT);
    return response.data;
  };

export const getAvailableContainers = async (): Promise<Container[]> => {
  const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS.AVAILABLE);
  return response.data;
};

export const updateContainerLocation = async (id: number, city_name: string) => {
  const response = await api.put(`${ENDPOINTS.ADMIN.CONTAINERS.ALL}${id}/location/`, {
    city_name,
  });
  return response.data;
};