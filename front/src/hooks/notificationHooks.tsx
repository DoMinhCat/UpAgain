import { useState, useEffect } from "react";
import OneSignal from "react-onesignal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotiSettings, updateNotiSetting } from "../api/notificationModule";
import type { UpdateNotiSettingPayload } from "../api/interfaces/notification";
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
        "Setting updated",
        "Your notification preference has been updated.",
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
