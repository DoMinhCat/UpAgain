import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import { showErrorNotification } from "../../components/NotificationToast";

export interface Container {
  id: number;
  created_at: string;
  city_name: string;
  postal_code: string;
  status: 'ready' | 'full' | 'maintenance';
  is_deleted: boolean;
}

export async function getAllContainers() {
  try {
    const response = await api.get(ENDPOINTS.ADMIN.CONTAINERS);
    return response.data;
  } catch (error: any) {
    showErrorNotification("Error while getting containers", error);
    throw error;
  }
}

export const getContainerDetails = async (id: number) => {
  const response = await api.get(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`);
  return response.data;
};

export const updateContainerStatus = async (id: number, status: string) => {
  try {
    return await api.patch(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`, { status });
  } catch (error: any) {
    showErrorNotification("Error while updating container status", error);
    throw error;
  }
};  

export const deleteContainer = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.ADMIN.CONTAINERS}${id}/`);
  return response;
};