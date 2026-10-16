import { defineConfig, devices } from "@playwright/test";

const external = process.env.E2E_BASE_URL;
const baseURL = external || "http://localhost:4174";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Production build, not the dev server: this is what ships to S3. It is built
  // into .e2e-build so the tracked build/ is untouched.
  webServer: external
    ? undefined
    : {
        command: "npx vite build --outDir .e2e-build && npx vite preview --outDir .e2e-build --port 4174 --strictPort",
        url: "http://localhost:4174",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
