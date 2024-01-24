import deDE from "~/locales/de-DE.json";
import enGB from "~/locales/en-GB.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "de-DE",
  messages: {
    "de-DE": deDE,
    "en-GB": enGB,
  },
  numberFormats: {
    "en-GB": {
      currency: {
        style: "currency",
        currency: "GBP",
      },
      currencyNoCents: {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 0, // set fraction digits to 0 to remove cents
        maximumFractionDigits: 0,
      },
    },
    "de-DE": {
      currency: {
        style: "currency",
        currency: "EUR",
      },
      currencyNoCents: {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0, // set fraction digits to 0 to remove cents
        maximumFractionDigits: 0,
      },
    },
  },
}));
