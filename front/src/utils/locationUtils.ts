import { showErrorNotification } from "../components/common/NotificationToast";

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
            "Location request denied",
            "You denied location access.",
          );
        } else {
          showErrorNotification(
            "Location request failed",
            "An error occurred while fetching your location.",
          );
        }
        return null;
      },
    );
  } else {
    showErrorNotification(
      "Location request failed",
      "Geolocation is not supported by this browser.",
    );
    return null;
  }
  return null;
};
