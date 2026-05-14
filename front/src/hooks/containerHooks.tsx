import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllContainers,
  createContainer,
  updateContainerStatus,
  updateContainerLocation,
  deleteContainer,
  getContainerDetails,
  getContainerCountStats,
  getAvailableContainers,
  getContainerSchedule,
  getContainerEarliestAvailability,
  getNearestContainer,
} from "../api/containerModule";
import {
  type ContainerCountStats,
  type Container,
  type ContainerSchedule,
  type ContainerEarliestAvailability,
} from "../api/interfaces/container";
import { showSuccessNotification } from "../components/common/NotificationToast";
import type { Coordinates } from "../api/interfaces/location";

export const useGetAllContainers = (
  page: number = -1,
  limit: number = -1,
  search?: string,
  status?: string,
) => {
  return useQuery({
    queryKey: ["containers", page, limit, search, status],
    queryFn: () => getAllContainers(page, limit, search, status),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "admin:containers.notifications.error_loading_containers",
      errorMessage: "admin:containers.notifications.error_loading_containers",
    },
  });
};

export const useCreateContainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContainer,
    meta: {
      errorTitle: "admin:containers.notifications.error_creating",
      errorMessage: "admin:containers.notifications.error_creating",
    },
    onSuccess: () => {
      showSuccessNotification(
        "admin:containers.notifications.create_success_title",
        "admin:containers.notifications.create_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["availableContainers"] });
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateContainerStatus(id, status),

    onSuccess: (_data, variables) => {
      showSuccessNotification(
        "admin:containers.notifications.update_status_success_title",
        "admin:containers.notifications.update_status_success_message",
      );

      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["availableContainers"] });
      queryClient.invalidateQueries({
        queryKey: ["containerDetails", variables.id],
      });
    },
    meta: {
      errorTitle: "admin:containers.notifications.error_updating_status",
      errorMessage: "admin:containers.notifications.error_updating_status",
    },
  });
};

export const useDeleteContainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContainer,
    meta: {
      errorTitle: "admin:containers.notifications.error_deleting",
      errorMessage: "admin:containers.notifications.error_deleting",
    },
    onSuccess: () => {
      showSuccessNotification(
        "admin:containers.notifications.delete_success_title",
        "admin:containers.notifications.delete_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
  });
};
export const useContainerDetails = (id: number, isValidId?: boolean) => {
  return useQuery<Container>({
    queryKey: ["containerDetails", id],
    queryFn: () => getContainerDetails(id),
    enabled: !!id && (isValidId ?? true),
    meta: {
      errorTitle: "admin:containers.notifications.error_loading_details",
      errorMessage: "admin:containers.notifications.error_loading_details",
    },
    staleTime: 1000 * 60 * 2, // refresh data every 2m
  });
};

export const useGetContainerStats = () => {
  return useQuery<ContainerCountStats>({
    queryKey: ["containerCountStats"],
    queryFn: getContainerCountStats,
    meta: {
      errorTitle: "admin:containers.notifications.error_loading_stats",
      errorMessage: "admin:containers.notifications.error_loading_stats",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};

export const useGetAvailableContainers = () => {
  return useQuery<Container[]>({
    queryKey: ["availableContainers"],
    queryFn: getAvailableContainers,
    meta: {
      errorTitle: "admin:containers.notifications.error_loading_available",
      errorMessage: "admin:containers.notifications.error_loading_available",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      city_name,
      street,
    }: {
      id: number;
      city_name: string;
      street: string;
    }) => updateContainerLocation(id, city_name, street),
    onSuccess: (_data, variables) => {
      showSuccessNotification(
        "admin:containers.notifications.update_location_success_title",
        "admin:containers.notifications.update_location_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({
        queryKey: ["containerDetails", variables.id],
      });
    },
    meta: {
      errorTitle: "admin:containers.notifications.error_updating_location",
      errorMessage: "admin:containers.notifications.error_updating_location",
    },
  });
};

export const useGetContainerSchedule = (id: number) => {
  return useQuery<ContainerSchedule>({
    queryKey: ["containerSchedule", id],
    queryFn: () => getContainerSchedule(id),
    enabled: !!id,
    meta: {
      errorTitle: "admin:containers.notifications.error_loading_schedule",
      errorMessage: "admin:containers.notifications.error_loading_schedule",
    },
    staleTime: 1000 * 60 * 2, // refresh data every 2m
  });
};
export const useGetContainerEarliestAvailability = (
  id: number,
  enabled: boolean = true,
) => {
  return useQuery<ContainerEarliestAvailability>({
    queryKey: ["containerEarliestAvailability", id],
    queryFn: () => getContainerEarliestAvailability(id),
    enabled: !!id && enabled,
    meta: {
      errorTitle: "marketplace:notifications.fetch_earliest_error",
      errorMessage: "marketplace:notifications.fetch_earliest_error",
    },
    staleTime: 1000 * 60 * 2, // refresh data every 2m
  });
};

export const useGetNearestContainer = (
  coordinates: Coordinates | null,
  enabled: boolean = false,
) => {
  return useQuery<Container>({
    queryKey: [
      "nearestContainer",
      coordinates?.latitude,
      coordinates?.longitude,
    ],
    queryFn: () => getNearestContainer(coordinates!),
    enabled: !!coordinates?.latitude && !!coordinates?.longitude && enabled,
    meta: {
      errorTitle: "marketplace:notifications.fetch_nearest_error",
      errorMessage: "marketplace:notifications.fetch_nearest_error",
    },
    staleTime: 1000 * 60 * 5, // refresh data every 5m
  });
};
