import i18n from "i18next";

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem("i18nextLng", lng);
};
