import { test, expect, expectAllImagesLoaded, projects } from "./fixtures";

test.describe("home page", () => {
  test("renders every section with no broken images or failed requests @smoke", async ({ page, failedRequests }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Hello, I'm Ben Nguyen" })).toBeVisible();
    for (const id of ["about", "experience", "projects", "contact"]) {
      await expect(page.locator(`section#${id}`)).toBeAttached();
    }
    await expectAllImagesLoaded(page);
    expect(failedRequests).toEqual([]);
  });

  test("shows only featured projects and links to the full list", async ({ page }) => {
    await page.goto("/");
    const featured = projects.filter((p) => p.featured);
    const cards = page.locator("section#projects [role='link']");
    await expect(cards).toHaveCount(featured.length);
    await page.getByRole("link", { name: /view all projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { level: 2, name: "All Projects" })).toBeVisible();
  });

  test("the Contact Me button jumps to the contact section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Contact Me" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("section#contact")).toBeInViewport();
  });
});
