import { Checkbox } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OneSignal from "react-onesignal";
import { useAuth } from "../../context/AuthContext";

export default function EnableNotiCheckBox() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // Check initial status
    const status =
      OneSignal.User.PushSubscription.optedIn &&
      Notification.permission === "granted";
    setIsSubscribed(status || false);

    // Listen for changes (optional but recommended)
    OneSignal.User.PushSubscription.addEventListener("change", (event) => {
      setIsSubscribed(event.current.optedIn);
    });
  }, []);

  useEffect(() => {
    if (Notification.permission === "denied") {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, []);

  const togglePushNotifications = async () => {
    if (isBlocked) {
      setIsSubscribed(false);
      return;
    }

    if (isSubscribed) {
      // Opt Out
      await OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
    } else {
      // Opt In (This will trigger the browser prompt if not already accepted)
      await OneSignal.User.PushSubscription.optIn();
      const status =
        OneSignal.User.PushSubscription.optedIn &&
        Notification.permission === "granted";
      setIsSubscribed(status || false);
      setIsBlocked(Notification.permission === "denied");
    }
  };

  if (!user) return null;

  return (
    <Checkbox
      label={t("common:notifications.btn_push_noti")}
      mt="md"
      size="lg"
      checked={isSubscribed}
      onChange={togglePushNotifications}
      description={isBlocked ? t("common:notifications.blocked_desc") : ""}
    />
  );
}
