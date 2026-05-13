import type { GeocodeResult } from "../api/interfaces/location";
import { showErrorNotification } from "../components/common/NotificationToast";
import i18n from "i18next";

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

export const parseGeocodeResponse = (result: GeocodeResult) => {
  const getComponent = (type: string) =>
    result.address_components.find((c) => c.types.includes(type))?.long_name ||
    "";

  return {
    streetNumber: getComponent("street_number"), // 21
    route: getComponent("route"), // rue erard
    city: getComponent("locality"), // Paris
    postalCode: getComponent("postal_code"), // 75012
    state: getComponent("administrative_area_level_1"), // Île-de-France
    country: getComponent("country"), // France
    lat: result.geometry.location.lat, // 48.8461183
    lng: result.geometry.location.lng, // 2.3856301
  };
};
