import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
    },
  },
  experimental: {
    payloadExtraction: true,
  },
  nitro: {
    compressPublicAssets: true,
  },
  app: {
    head: {
      title: "Beauty-Time Booking",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  compatibilityDate: "2026-02-27",
});
