import { expect, test } from "@playwright/test";

test("the sandbox editor can publish a draft only after review", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.getByText("local-desk")).toBeVisible();
  await page.getByLabel("Desk code").fill("wrong-code");
  await page.getByRole("button", { name: "Unlock editor desk" }).click();
  await expect(page.locator("#desk-code-error")).toBeVisible();

  await page.getByLabel("Desk code").fill("local-desk");
  await page.getByRole("button", { name: "Unlock editor desk" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Editor desk unlocked" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "paper-form" })).toBeVisible();

  await page.getByRole("listitem").filter({ hasText: "paper-form" }).getByRole("link", { name: "Working copy" }).click();
  await page.getByRole("checkbox", { name: /I looked at the source page/ }).check();
  await page.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Marked reviewed" })).toBeVisible();

  await page.goto("/guides/paper-form");
  await expect(page.getByRole("heading", { level: 1, name: "Read a paper form without sending it" })).toBeVisible();
  await expect(page.getByText("Lumen will not fill it in")).toBeVisible();
});

test("accessibility settings persist and a confusing note is stored", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/accessibility");
  await page.getByLabel("Largest").check();
  await page.getByLabel("Higher contrast").check();
  await page.getByRole("checkbox", { name: "Simpler language" }).check();
  await page.getByRole("checkbox", { name: "Reduce motion" }).check();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Settings saved" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/04-access-390.png" });
  await page.reload();
  await expect(page.getByLabel("Largest")).toBeChecked();
  await expect(page.getByLabel("Higher contrast")).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-scale", "1.3");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/guides/check-email");
  await page.getByRole("button", { name: "Start this guide" }).click();
  await expect(page.getByText("Simpler wording is on.")).toBeVisible();
  await page.getByRole("checkbox", { name: "This was confusing" }).check();
  await page.getByLabel("What was confusing?").fill("The sender address example was the hard part.");
  await page.getByRole("button", { name: "Send note" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Note saved" })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Check an email before you click" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/05-progress-1440.png" });
});
