import { test, expect, stubEmailJs } from "./fixtures";

// Never run against a real deployment: the stub below is the only thing
// standing between this test and an actual email.
test.skip(!!process.env.E2E_BASE_URL, "contact form specs only run against the local build");

const fill = async (page) => {
  await page.getByPlaceholder("First Name").fill("Ada");
  await page.getByPlaceholder("Last Name").fill("Lovelace");
  await page.getByPlaceholder("Email Address").fill("ada@example.com");
  await page.getByPlaceholder("Subject").fill("Playwright test");
  await page.getByPlaceholder("Message").fill("This request was intercepted.");
};

test.describe("contact form", () => {
  test("submits the typed values to EmailJS and shows success", async ({ page }) => {
    const requests = await stubEmailJs(page, { status: 200 });
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Message sent successfully!")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

    expect(requests).toHaveLength(1);
    const body = requests[0].postDataBuffer().toString("utf8");
    for (const [field, value] of [
      ["first_name", "Ada"],
      ["last_name", "Lovelace"],
      ["user_email", "ada@example.com"],
      ["subject", "Playwright test"],
      ["message", "This request was intercepted."],
    ]) {
      expect(body).toContain(`name="${field}"\r\n\r\n${value}\r\n`);
    }
  });

  test("shows an error when EmailJS rejects the request", async ({ page }) => {
    await stubEmailJs(page, { status: 400 });
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Something went wrong, please try again later.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });
});
