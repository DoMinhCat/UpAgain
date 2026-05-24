import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import {
  type Container,
  type ContainerCountStats,
  type ContainerListPagination,
  type ContainerSchedule,
  type ContainerEarliestAvailability,
} from "./interfaces/container";
import type { Coordinates } from "./interfaces/location";

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
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS.ALL}/${id}`);
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

export const updateContainerLocation = async (
  id: number,
  city_name: string,
  street: string,
  postal_code: string,
) => {
  const response = await api.put(
    `${ENDPOINTS.ADMIN.CONTAINERS.ALL}${id}/location/`,
    {
      city_name,
      street,
      postal_code,
    },
  );
  return response.data;
};

export const getContainerSchedule = async (
  id: number,
): Promise<ContainerSchedule> => {
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS.SCHEDULE(id)}`);
  return response.data;
};

export const getContainerEarliestAvailability = async (
  id: number,
): Promise<ContainerEarliestAvailability> => {
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS.EARLIEST(id)}`);
  return response.data;
};

export const getNearestContainer = async (
  coordinates: Coordinates,
): Promise<Container> => {
  const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS.NEAREST, {
    params: { lat: coordinates.latitude, lng: coordinates.longitude },
  });
  return response.data;
};

export const openContainer = async (
  id: number,
  payload: { code6digit?: string; barcode?: File },
) => {
  const formData = new FormData();
  if (payload.code6digit) {
    formData.append("code6digit", payload.code6digit);
  }
  if (payload.barcode) {
    formData.append("barcode", payload.barcode);
  }

  const response = await api.post(
    ENDPOINTS.ADMIN.CONTAINERS.OPEN(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
