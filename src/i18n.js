import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

const settings = window.api.getSettings();

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: settings.language || "ar",
    supportedLngs: ["en", "ar"],

    backend: {
      loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}.json`,
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  if (lng === "ar") {
    document.body.dir = "rtl";
  } else {
    document.body.dir = "ltr";
  }
});

export default i18n;
