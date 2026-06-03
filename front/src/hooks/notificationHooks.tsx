import { useState, useEffect } from "react";
import OneSignal from "react-onesignal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotiSettings,
  updateNotiSetting,
  getNotifications,
  markNotificationsAsRead,
  deleteNotification,
} from "../api/notificationModule";
import type {
  UpdateNotiSettingPayload,
  NotificationDetail,
  MarkNotificationsReadPayload,
} from "../api/interfaces/notification";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useGetNotiSettings = (id_account: number) => {
  return useQuery({
    queryKey: ["notiSettings", id_account],
    queryFn: () => getNotiSettings(id_account),
    enabled: !!id_account,
  });
};

export const useUpdateNotiSetting = (id_account: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNotiSettingPayload) =>
      updateNotiSetting(id_account, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notiSettings", id_account] });
      showSuccessNotification(
        "profile:notifications.update_success_title",
        "profile:notifications.update_success_message",
      );
    },
  });
};

export const usePushNotificationStatus = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status =
        OneSignal.User.PushSubscription.optedIn &&
        Notification.permission === "granted";
      setIsSubscribed(status || false);
      setIsBlocked(Notification.permission === "denied");

      const handleSubscriptionChange = (event: any) => {
        setIsSubscribed(event.current.optedIn);
      };

      OneSignal.User.PushSubscription.addEventListener(
        "change",
        handleSubscriptionChange,
      );

      return () => {
        OneSignal.User.PushSubscription.removeEventListener(
          "change",
          handleSubscriptionChange,
        );
      };
    };

    checkStatus();
  }, []);

  return { isSubscribed, isBlocked, setIsBlocked, setIsSubscribed };
};

export const useGetNotifications = (enabled: boolean = true) => {
  return useQuery<NotificationDetail[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled,
    meta: {
      errorTitle: "common:notifications.error_loading",
      errorMessage: "common:notifications.error_loading",
    },
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkNotificationsReadPayload) =>
      markNotificationsAsRead(payload),
    meta: {
      errorTitle: "common:notifications.error_updating",
      errorMessage: "common:notifications.error_updating",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notiId: string) => deleteNotification(notiId),
    meta: {
      errorTitle: "common:notifications.error_deleting",
      errorMessage: "common:notifications.error_deleting",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
