import { test, expect } from "./fixtures";

test.describe("navbar on desktop", () => {
  test("section links scroll to their anchors", async ({ page }) => {
    await page.goto("/");
    for (const [name, id] of [["About", "about"], ["Experience", "experience"], ["Projects", "projects"], ["Contact", "contact"]]) {
      await page.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`section#${id}`)).toBeInViewport();
    }
  });

  test("section links work from a project page", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.locator("section#about")).toBeInViewport();
  });

  test("brand image returns home", async ({ page }) => {
    await page.goto("/projects");
    // exact: true, otherwise "Back to home" on /projects also matches
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("external links open in a new tab and are not followed", async ({ page }) => {
    await page.goto("/");
    const linkedin = page.getByRole("link", { name: "Linkedin" });
    const github = page.getByRole("link", { name: "Github" });
    const resume = page.getByRole("link", { name: "Resume" });
    await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/hnguyentran03/");
    await expect(github).toHaveAttribute("href", "https://github.com/hnguyentran03");
    await expect(resume).toHaveAttribute("href", "/ben_nguyen_resume.pdf");
    for (const link of [linkedin, github, resume]) {
      await expect(link).toHaveAttribute("target", "_blank");
    }
  });

  test("the resume PDF is actually served", async ({ request }) => {
    const res = await request.get("/ben_nguyen_resume.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });
});

test.describe("navbar on mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("toggler expands the collapsed menu", async ({ page }) => {
    await page.goto("/");
    const collapse = page.locator("#basic-navbar-nav");
    await expect(collapse).not.toBeVisible();
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await expect(collapse).toBeVisible();
    await expect(page.getByRole("link", { name: "About", exact: true })).toBeVisible();
  });
});
