import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "cypress"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        ".next",
        "cypress",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/*",
      ],
    },
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "./components"),
      contexts: path.resolve(__dirname, "./contexts"),
      utils: path.resolve(__dirname, "./utils"),
      lib: path.resolve(__dirname, "./lib"),
      lang: path.resolve(__dirname, "./lang"),
      pages: path.resolve(__dirname, "./pages"),
      server: path.resolve(__dirname, "./server"),
      graphql: path.resolve(__dirname, "./graphql"),
    },
  },
});
