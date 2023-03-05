import { defineConfig } from "cypress";
require("dotenv").config({ path: "./ui/.env.test" });

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 15000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3000/",
    env: {
      termsURL: process.env.TERMS_URL,
      email: `user${Date.now()}@test.com`, // This email will be used to register/login a user for testing
      magicLinkSecret: process.env.MAGIC_LINK_SECRET || "potatopotatopotato", // use magic link secret from .env.local
      roundSlug: `round${Date.now()}`, // default round slug
    },
  },
});
