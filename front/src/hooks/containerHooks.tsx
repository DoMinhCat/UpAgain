import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAllContainers, 
  createContainer, 
  updateContainerStatus, 
  deleteContainer, 
  getContainerDetails
} from "../api/admin/containerModule";
import { showSuccessNotification } from "../components/NotificationToast";

export const useContainers = () => {
  return useQuery({
    queryKey: ["containers"],
    queryFn: getAllContainers,
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

      queryClient.invalidateQueries({ 
        queryKey: ["containerDetails", variables.id] 
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
    },
  });
};
export const useContainerDetails = (id: number) => {
  return useQuery({
    queryKey: ["containerDetails", id],
    queryFn: () => getContainerDetails(id),
    enabled: !!id,
    meta: {
      errorTitle: "Details Error",
      errorMessage: `Could not load information for container #${id}`,
    },
  });
};
