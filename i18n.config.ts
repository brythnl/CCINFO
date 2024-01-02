import deDE from "~/locales/de-DE.json";
import enGB from "~/locales/en-GB.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "de-DE",
  messages: {
    "de-DE": deDE,
    "en-GB": enGB,
  }
}));
