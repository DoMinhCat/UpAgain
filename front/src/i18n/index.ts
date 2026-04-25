import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export const LANGUAGES = [
  { label: "English", path: "united-kingdom", lng: "en" },
  { label: "Français", path: "france", lng: "fr" },
  { label: "Tiếng Việt", path: "vietnam", lng: "vi" },
];

const namespaces = [
  "about",
  "admin",
  "auth",
  "common",
  "community",
  "contact",
  "errors",
  "events",
  "home",
  "marketplace",
];

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    supportedLngs: LANGUAGES.map((lang) => lang.lng),
    ns: namespaces,
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });
