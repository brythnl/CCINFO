// https://nuxt.com/docs/api/configuration/nuxt-config
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
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    'dayjs-nuxt',
    "@nuxtjs/tailwindcss",
  ],
  vite: {
    vue: {
      template: {
        // to resolve relative asset URLs passed to vuetify components
        transformAssetUrls,
      },
    },
  },
  dayjs: {
    plugins: ['customParseFormat'],
  },
  ssr: false,
});
