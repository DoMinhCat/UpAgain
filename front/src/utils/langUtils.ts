import i18n from "i18next";
import OneSignal from "react-onesignal";

export const changeLanguage = (lng: string) => {
  OneSignal.User.setLanguage(lng);
  i18n.changeLanguage(lng);
  localStorage.setItem("i18nextLng", lng);
};
