import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.ts";
import viTranslation from "./locales/vi/translation.ts"
// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      vi: {
        translation: viTranslation,
      },
    },
    lng: localStorage.getItem("lang") || "vi", // Default language
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
