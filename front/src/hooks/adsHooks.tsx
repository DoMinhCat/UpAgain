import { useMutation } from "@tanstack/react-query";
import { createAds, deleteAds, updateAds } from "../api/adsModule";
import {
  type CreateAdsRequest,
  type UpdateAdsRequest,
} from "../api/interfaces/ads";
import { showSuccessNotification } from "../components/common/NotificationToast";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdsRequest) => createAds(payload),
    onSuccess: (variables) => {
      showSuccessNotification("Ad created", "Ad created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({
        queryKey: ["postDetails", variables.id_post],
      });
    },
    meta: {
      errorTitle: "Ad creation failed",
      errorMessage: "Failed to create ad",
    },
  });
};

export const useDeleteAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_ads: number) => deleteAds(id_ads),
    onSuccess: () => {
      showSuccessNotification("Ad deleted", "Ad deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails"] });
    },
    meta: {
      errorTitle: "Ad deletion failed",
      errorMessage: "Failed to delete ad",
    },
  });
};

export const useUpdateAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_ads,
      payload,
    }: {
      id_ads: number;
      payload: UpdateAdsRequest;
    }) => updateAds(id_ads, payload),
    onSuccess: (variables) => {
      showSuccessNotification("Ad updated", "Ad updated successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({
        queryKey: ["postDetails", variables.id_post],
      });
    },
    meta: {
      errorTitle: "Ad update failed",
      errorMessage: "Failed to update ad",
    },
  });
};
