import { expect, test, type Page } from "@playwright/test";

async function tabTo(page: Page, name: string) {
  for (let i = 0; i < 40; i += 1) {
    const text = await page.evaluate(
      () => document.activeElement?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    );
    if (text === name) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Could not reach ${name} with the keyboard`);
}

test("a completed step stays complete after refresh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides/stronger-password");
  await page.getByRole("button", { name: "Start this guide" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Know what a strong password is" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/03-step-390.png" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: "docs/screenshots/03-step-1440.png" });
  await page.setViewportSize({ width: 390, height: 844 });

  await page.getByRole("button", { name: "I did this step" }).click();
  await expect(page.getByText("You marked this step done.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("You marked this step done.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as not done" })).toBeVisible();
});

test("keyboard only can finish a guide", async ({ page }) => {
  await page.goto("/guides/check-email");
  await tabTo(page, "Start this guide");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (let step = 0; step < 4; step += 1) {
    const label = step === 3 ? "Finish and save" : "Next";
    await tabTo(page, label);
    const before = page.url();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).not.toBe(before);
  }
  await expect(page.getByRole("heading", { name: "You finished the steps" })).toBeVisible();
  await expect(page.getByText("Lumen did not do the task for you.")).toBeVisible();
});

test("a lost connection does not claim the step was saved", async ({ page }) => {
  await page.goto("/guides/stronger-password");
  await page.getByRole("button", { name: "Start this guide" }).click();
  await expect(page.locator("form[data-ready='yes']").first()).toBeVisible();
  await page.route("**/api/sessions/**/progress", (route) => route.abort());
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("could not reach this server")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Know what a strong password is" })).toBeVisible();
});

test("another browser cannot read the first person's session", async ({ browser }) => {
  const owner = await browser.newContext();
  const stranger = await browser.newContext();
  const ownerPage = await owner.newPage();
  const strangerPage = await stranger.newPage();
  await ownerPage.goto("/guides/check-email");
  await ownerPage.getByRole("button", { name: "Start this guide" }).click();
  const sessionId = await ownerPage.locator("[data-session-id]").getAttribute("data-session-id");
  expect(sessionId).toBeTruthy();

  await strangerPage.goto("/guides/stronger-password");
  await strangerPage.getByRole("button", { name: "Start this guide" }).click();
  const denied = await strangerPage.request.get(`/api/sessions/${sessionId}`, {
    headers: { origin: "http://localhost:3000" },
  });
  expect(denied.status()).toBe(404);
  await owner.close();
  await stranger.close();
});
