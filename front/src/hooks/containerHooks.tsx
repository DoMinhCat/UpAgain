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
} from "../api/containerModule";
import {
  type ContainerCountStats,
  type Container,
} from "../api/interfaces/container";
import { showSuccessNotification } from "../components/NotificationToast";

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
      errorTitle: "Inventory Error",
      errorMessage: "Unable to load containers from European hubs.",
    },
  });
};

export const useCreateContainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContainer,
    meta: {
      errorTitle: "Deployment Failed",
      errorMessage: "Could not create the new container. Please check network.",
    },
    onSuccess: () => {
      showSuccessNotification("Success", "New container deployed");
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
      showSuccessNotification("Updated", "Container status modified");

      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["availableContainers"] });
      queryClient.invalidateQueries({
        queryKey: ["containerDetails", variables.id],
      });
    },
    meta: {
      errorTitle: "Status Update Failed",
      errorMessage: "Failed to update container state.",
    },
  });
};

export const useDeleteContainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContainer,
    meta: {
      errorTitle: "Deletion Error",
      errorMessage: "Could not remove container from inventory.",
    },
    onSuccess: () => {
      showSuccessNotification("Deleted", "Container archived successfully");
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
  });
};
export const useContainerDetails = (id: number) => {
  return useQuery<Container>({
    queryKey: ["containerDetails", id],
    queryFn: () => getContainerDetails(id),
    enabled: !!id,
    meta: {
      errorTitle: "Details Error",
      errorMessage: `Could not load information for container #${id}`,
    },
    staleTime: 1000 * 60 * 2, // refresh data every 2m
  });
};

export const useGetContainerStats = () => {
  return useQuery<ContainerCountStats>({
    queryKey: ["containerCountStats"],
    queryFn: getContainerCountStats,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load container count stats",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};

export const useGetAvailableContainers = () => {
  return useQuery<Container[]>({
    queryKey: ["availableContainers"],
    queryFn: getAvailableContainers,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load available containers",
    },
    staleTime: 1000 * 60, // refresh data every 1m
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, city_name }: { id: number; city_name: string }) =>
      updateContainerLocation(id, city_name),
    onSuccess: (_data, variables) => {
      showSuccessNotification("Updated", "Container location modified");
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({
        queryKey: ["containerDetails", variables.id],
      });
    },
    meta: {
      errorTitle: "Location Update Failed",
      errorMessage: "Failed to update container location.",
    },
  });
};