export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Beauty-Time CRM',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  compatibilityDate: '2026-02-27',
});
