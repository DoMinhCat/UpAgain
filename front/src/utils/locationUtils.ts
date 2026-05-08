import { showErrorNotification } from "../components/common/NotificationToast";
import i18n from "i18next";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        return { latitude, longitude };
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          showErrorNotification(
            i18n.t("common:notifications.location.denied_title"),
            i18n.t("common:notifications.location.denied_message"),
          );
        } else {
          showErrorNotification(
            i18n.t("common:notifications.location.failed_title"),
            i18n.t("common:notifications.location.failed_message"),
          );
        }
        return null;
      },
    );
  } else {
    showErrorNotification(
      i18n.t("common:notifications.location.failed_title"),
      i18n.t("common:notifications.location.not_supported_message"),
    );
    return null;
  }
  return null;
};
