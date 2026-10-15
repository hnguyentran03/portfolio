import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./vitest.setup.js"],
      include: ["src/**/*.test.{js,jsx}"],
      exclude: ["e2e/**", "node_modules/**", "build/**"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{js,jsx}"],
        exclude: ["src/main.jsx", "src/test/**", "src/**/*.test.{js,jsx}"],
      },
    },
  })
);
