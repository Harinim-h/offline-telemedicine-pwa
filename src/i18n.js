import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import ml from "./locales/ml.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      ml: { translation: ml }
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    },

    // 🔥 THIS IS THE MISSING PIECE
    react: {
      useSuspense: false
    }
  });

export default i18n;
