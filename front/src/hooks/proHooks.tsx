import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProAnalytics,
  getProAlertMaterials,
  updateProAlertMaterials,
} from "../api/proModule";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useGetProAnalytics = (idAccount: number | undefined) => {
  return useQuery({
    queryKey: ["proAnalytics", idAccount],
    queryFn: () => getProAnalytics(idAccount!),
    enabled: idAccount !== undefined && !isNaN(idAccount),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetProAlertMaterials = (idAccount: number | undefined) => {
  return useQuery({
    queryKey: ["proAlertMaterials", idAccount],
    queryFn: () => getProAlertMaterials(idAccount!),
    enabled: idAccount !== undefined && !isNaN(idAccount),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProAlertMaterials = (idAccount: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materials: string[]) =>
      updateProAlertMaterials(idAccount!, materials),
    meta: {
      errorTitle: "profile:notifications.update_failed_title",
      errorMessage: "profile:notifications.update_failed_desc",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["proAlertMaterials", idAccount],
      });
      showSuccessNotification(
        "profile:notifications.update_success_title",
        "profile:notifications.update_success_message",
      );
    },
  });
};
