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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({
        queryKey: ["postDetails", variables.id_post],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPostDetails", variables.id_post],
      });
    },
    meta: {
      errorTitle: "admin:posts.notifications.error_creating_ads",
      errorMessage: "admin:posts.notifications.error_creating_ads",
    },
  });
};

export const useDeleteAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_ads: number) => deleteAds(id_ads),
    onSuccess: () => {
      showSuccessNotification(
        "admin:posts.notifications.ads_deleted_title",
        "admin:posts.notifications.ads_deleted_msg",
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails"] });
      queryClient.invalidateQueries({ queryKey: ["userPostDetails"] });
    },
    meta: {
      errorTitle: "admin:posts.notifications.error_deleting_ads",
      errorMessage: "admin:posts.notifications.error_deleting_ads",
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
      showSuccessNotification(
        "admin:posts.notifications.ads_updated_title",
        "admin:posts.notifications.ads_updated_msg",
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({
        queryKey: ["postDetails", variables.id_post],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPostDetails", variables.id_post],
      });
    },
    meta: {
      errorTitle: "admin:posts.notifications.error_updating_ads",
      errorMessage: "admin:posts.notifications.error_updating_ads",
    },
  });
};
