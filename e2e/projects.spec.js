import { test, expect, expectAllImagesLoaded, projects } from "./fixtures";

const first = projects[0];
const markdownBody = (page) => page.locator('section [class*="markdown"]');
const cardFor = (page, title) =>
  page.locator("[role='link']").filter({ has: page.getByRole("heading", { level: 3, name: title, exact: true }) });

test.describe("projects list", () => {
  test("lists every project from projects.json", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("[role='link']")).toHaveCount(projects.length);
    await expectAllImagesLoaded(page);
  });

  test("clicking a card opens its project page", async ({ page }) => {
    await page.goto("/projects");
    await cardFor(page, first.title).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
    await expect(page.getByRole("heading", { level: 2, name: first.title })).toBeVisible();
  });

  test("pressing Enter on a focused card opens its project page", async ({ page }) => {
    await page.goto("/projects");
    await cardFor(page, first.title).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
  });

  test("opening a project resets the scroll position", async ({ page }) => {
    await page.goto("/projects");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await cardFor(page, projects[projects.length - 1].title).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("back link returns to the list", async ({ page }) => {
    await page.goto(`/projects/${first.slug}`);
    await page.getByRole("link", { name: /back to projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await page.getByRole("link", { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("project page", () => {
  test("deep link renders the project directly @smoke", async ({ page, failedRequests }) => {
    const response = await page.goto(`/projects/${first.slug}`);
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 2, name: first.title })).toBeVisible();
    await expect(page.getByRole("img", { name: `Image of ${first.title}` })).toBeVisible();
    await expectAllImagesLoaded(page);
    expect(failedRequests).toEqual([]);
  });

  test("deep link with a trailing slash also renders the project", async ({ page }) => {
    await page.goto(`/projects/${first.slug}/`);
    await expect(page.getByRole("heading", { level: 2, name: first.title })).toBeVisible();
  });

  test("renders the markdown body, skills, and external links without clicking them", async ({ page }) => {
    await page.goto(`/projects/${first.slug}`);
    await expect(markdownBody(page)).toBeVisible();
    await expect(markdownBody(page).locator("> *").first()).toBeVisible();
    for (const skill of first.skills) {
      await expect(page.getByRole("listitem").filter({ hasText: skill }).first()).toBeVisible();
    }
    if (first.source) {
      const source = page.getByRole("link", { name: "Source" });
      await expect(source).toHaveAttribute("href", first.source);
      await expect(source).toHaveAttribute("target", "_blank");
      await expect(source).toHaveAttribute("rel", "noopener noreferrer");
    }
    if (first.demo) {
      const demo = page.getByRole("link", { name: "Demo" });
      await expect(demo).toHaveAttribute("href", first.demo);
      await expect(demo).toHaveAttribute("target", "_blank");
    }
  });

  test("every project page renders its title and at least one body element", async ({ page }) => {
    test.setTimeout(120_000);
    for (const project of projects) {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.getByRole("heading", { level: 2, name: project.title })).toBeVisible();
      await expect(markdownBody(page).locator("> *").first()).toBeVisible();
    }
  });
});
