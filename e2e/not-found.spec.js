import { test, expect } from "./fixtures";

test.describe("404 page", () => {
  test("unknown route renders the 404 page as a soft 404 @smoke", async ({ page }) => {
    const response = await page.goto("/this/does/not/exist");
    // The edge cannot tell an unknown route from a valid one, so the shell
    // comes back 200 and the client renders the 404 copy (see CLAUDE.md).
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 2, name: "Page Not Found" })).toBeVisible();
    await expect(page.getByText("404")).toBeVisible();
  });

  test("unknown project slug renders the 404 page @smoke", async ({ page }) => {
    await page.goto("/projects/definitely-not-a-project");
    await expect(page.getByRole("heading", { level: 2, name: "Page Not Found" })).toBeVisible();
  });

  test("back to home link works from the 404 page", async ({ page }) => {
    await page.goto("/nope");
    await page.getByRole("link", { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
