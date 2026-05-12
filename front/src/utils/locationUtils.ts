import { showErrorNotification } from "../components/common/NotificationToast";
import i18n from "i18next";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      showErrorNotification(
        i18n.t("common:notifications.location.failed_title"),
        i18n.t("common:notifications.location.not_supported_message"),
      );
      return resolve(null); // Resolve with null so the app keeps running
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude }); // Success!
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
        resolve(null); // Handle error but resolve so the 'await' finishes
      },
    );
  });
};
