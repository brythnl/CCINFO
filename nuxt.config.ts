import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      // Change vite config
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // Add vuetify plugin to array of vite plugins
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "dayjs-nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "@nuxtjs/google-fonts",
  ],
  i18n: {
    locales: ["de-DE", "en-GB"],
    defaultLocale: "de-DE",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    vueI18n: "./i18n.config.ts",
  },
  vite: {
    vue: {
      template: {
        // to resolve relative asset URLs passed to vuetify components
        transformAssetUrls,
      },
    },
  },
  googleFonts: {
    families: {
      // a simple name
      Poppins: true,
      Lato: true,
      Roboto: true,
    },
  },
  dayjs: {
    plugins: ["customParseFormat"],
  },
  ssr: false,
});
