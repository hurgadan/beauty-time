import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

const crmContractsPath = fileURLToPath(
  new URL("../api/src/contracts/crm/index.ts", import.meta.url),
);

export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  alias: {
    "@beauty-time/crm-contracts": crmContractsPath,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
    },
  },
  app: {
    head: {
      title: "Beauty-Time CRM",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
  compatibilityDate: "2026-02-27",
});
