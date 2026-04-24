import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

export const LANGUAGES = [
  { label: "English", path: "united-kingdom", lng: "en" },
  { label: "Français", path: "france", lng: "fr" },
  { label: "Tiếng Việt", path: "vietnam", lng: "vi" },
];

i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: "en",
    supportedLngs: ["en", "fr", "vi"],
    ns: ["common", "auth", "errors"],
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
  });
