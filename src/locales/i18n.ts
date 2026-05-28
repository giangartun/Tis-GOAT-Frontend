import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./es/translation.json";
import en from "./en/translation.json";
import fr from "./fr/translation.json";

const idiomaGuardado = localStorage.getItem("lang") || "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: idiomaGuardado,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;