import { Checkbox } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OneSignal from "react-onesignal";
import { useAuth } from "../../context/AuthContext";

export default function EnableNotiCheckBox() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // Check initial status
    const status = OneSignal.User.PushSubscription.optedIn;
    setIsSubscribed(status || false);

    // Listen for changes (optional but recommended)
    OneSignal.User.PushSubscription.addEventListener("change", (event) => {
      setIsSubscribed(event.current.optedIn);
    });
  }, []);

  const togglePushNotifications = async () => {
    if (isSubscribed) {
      // Opt Out
      await OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
    } else {
      // Opt In (This will trigger the browser prompt if not already accepted)
      await OneSignal.User.PushSubscription.optIn();
      setIsSubscribed(true);
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
    />
  );
}
