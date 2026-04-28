import i18n from "i18next";
import OneSignal from "react-onesignal";
import { useAuth } from "../context/AuthContext";

export const changeLanguage = (lng: string) => {
  const { user } = useAuth();

  if (user) {
    OneSignal.User.setLanguage(lng);
  }
  i18n.changeLanguage(lng);
  localStorage.setItem("i18nextLng", lng);
};
