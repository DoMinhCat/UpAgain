import { useMutation } from "@tanstack/react-query";
import { createAds } from "../api/adsModule";
import { type CreateAdsRequest } from "../api/interfaces/ads";
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
