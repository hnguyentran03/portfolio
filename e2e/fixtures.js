import { test as base, expect } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
export const projects = require("../src/data/projects.json");

export const test = base.extend({
  // Collects any request that failed or returned >= 400 during the test.
  failedRequests: async ({ page }, use) => {
    const failed = [];
    page.on("requestfailed", (req) => failed.push(`FAILED ${req.url()}`));
    page.on("response", (res) => {
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
    });
    await use(failed);
  },
});

export { expect };

// Waits for every <img> on the page to settle, then reports the ones that
// never produced pixels (404s, bad paths, wrong case on S3).
export async function expectAllImagesLoaded(page) {
  const broken = await page.locator("img").evaluateAll(async (imgs) => {
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete
            ? null
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
      )
    );
    return imgs.filter((img) => img.naturalWidth === 0).map((img) => img.getAttribute("src"));
  });
  expect(broken, "images that failed to load").toEqual([]);
}

// Stubs the EmailJS endpoint so a test can submit the contact form without
// sending mail. Returns the captured requests for assertions.
export async function stubEmailJs(page, { status = 200 } = {}) {
  const requests = [];
  await page.route("**/api.emailjs.com/**", async (route) => {
    requests.push(route.request());
    await route.fulfill({ status, contentType: "text/plain", body: status === 200 ? "OK" : "Bad Request" });
  });
  return requests;
}
