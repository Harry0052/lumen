import { expect, test } from "@playwright/test";

test("home explains the job, stays usable, and has no dead primary control", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "What do you need help with?" })).toBeVisible();
  await expect(page.getByText("It does not fill in forms")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask for another wording" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Make a password that is hard to guess" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/01-home-390.png" });

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.screenshot({ path: "docs/screenshots/01-home-1440.png" });

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "That page is not in Lumen" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("a person can save a name and see it after refresh", async ({ page }) => {
  await page.goto("/account");
  await page.getByLabel("What should this browser call you?").fill("M");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.locator("#display-name-error")).toBeVisible();

  await page.getByLabel("What should this browser call you?").fill("Mina Chen");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Name saved" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("What should this browser call you?")).toHaveValue("Mina Chen");
  await expect(page.getByRole("banner").getByText("Mina Chen")).toBeVisible();
});
