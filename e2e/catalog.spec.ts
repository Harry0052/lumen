import { expect, test } from "@playwright/test";

test("search filters the real catalog and shows source dates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides");
  await page.getByLabel("Explain this").fill("passphrase");
  await page.getByRole("button", { name: "Show guides" }).click();
  await expect(page.getByRole("heading", { name: "Make a password that is hard to guess" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Check an email before you click" })).toHaveCount(0);
  await expect(page.getByText("CISA — Use strong passwords")).toBeVisible();
  await expect(page.getByText(/Reviewed:/)).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/02-guides-390.png" });

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: "docs/screenshots/02-guides-1440.png" });

  await page.getByLabel("Explain this").fill("zzzz-not-a-guide");
  await page.getByRole("button", { name: "Show guides" }).click();
  await expect(page.getByRole("heading", { name: "No guide matches those words" })).toBeVisible();
});

test("a stale guide is labeled and a draft is not public", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides/update-software");
  await expect(page.getByText("The review date on this copy of Lumen has passed.")).toBeVisible();
  await expect(page.getByRole("link", { name: "CISA — Update software" }).first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/06-stale-390.png" });

  await page.goto("/guides/paper-form");
  await expect(page.getByRole("heading", { name: "That page is not in Lumen" })).toBeVisible();

  const list = await request.get("/api/guides");
  expect(list.ok()).toBeTruthy();
  const body = (await list.json()) as { guides: { slug: string }[] };
  expect(body.guides.map((guide) => guide.slug)).not.toContain("paper-form");
  const hidden = await request.get("/api/guides/paper-form");
  expect(hidden.status()).toBe(404);
});
