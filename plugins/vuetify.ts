import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { VDatePicker } from "vuetify/labs/VDatePicker";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // configuration here
    components: {
      VDatePicker,
    },
    theme: {
      themes: {
        light: {
          /* My custom colors */
          colors: {
            primary: "#4195AC", // #E53935
          },
        },
      },
    },
  });
  app.vueApp.use(vuetify);
});
