import { expect, test } from "@playwright/test";

test("export has no token and delete removes the session", async ({ page }) => {
  await page.goto("/guides/stronger-password");
  await page.getByRole("button", { name: "Start this guide" }).click();
  await page.getByRole("button", { name: "I did this step" }).click();
  await expect(page.getByText("You marked this step done.")).toBeVisible();
  await page.goto("/account");
  await page.getByLabel("What should this browser call you?").fill("Nora Díaz");
  await page.getByRole("button", { name: "Save name" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download my data" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const text = await download.createReadStream().then(async (stream) => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf8");
  });
  const data = JSON.parse(text) as { profile: { displayName: string }; sessions: unknown[]; note: string };
  expect(data.profile.displayName).toBe("Nora Díaz");
  expect(data.sessions.length).toBeGreaterThan(0);
  expect(text).not.toMatch(/tokenHash/);
  expect(data.note).toMatch(/does not store passwords/);

  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete my data" }).click();
  await expect(page.getByRole("status").filter({ hasText: "deleted" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByText("You have not started a guide in this browser.")).toBeVisible();
});
