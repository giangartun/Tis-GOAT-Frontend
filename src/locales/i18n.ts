import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./es/translation.json";
import en from "./en/translation.json";
import fr from "./fr/translation.json";

const idiomaGuardado = localStorage.getItem("idioma") || "ES";

i18n.use(initReactI18next).init({
  resources: {
    ES: { translation: es },
    EN: { translation: en },
    FR: { translation: fr },
  },
  lng: idiomaGuardado,
  fallbackLng: "ES",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;