import { expect, test } from "@playwright/test";

test("switching language keeps the guide and the step", async ({ page }) => {
  await page.goto("/guides/stronger-password");
  await page.getByRole("button", { name: "Start this guide" }).click();
  await page.getByRole("button", { name: "I did this step" }).click();
  await expect(page.getByText("You marked this step done.")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Make a long passphrase" })).toBeVisible();

  await page.getByRole("button", { name: "Español" }).click();
  await expect(page.locator("p", { hasText: "Paso 2 de 5" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Invente una frase larga" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente" })).toBeVisible();
  await page.reload();
  await expect(page.locator("p", { hasText: "Paso 2 de 5" })).toBeVisible();
  await page.getByRole("button", { name: "Atrás" }).click();
  await expect(page.locator("p", { hasText: "Paso 1 de 5" })).toBeVisible();
  await expect(page.getByText("Marcó este paso como hecho.")).toBeVisible();
});

test("a missing translation stays in the reviewed language and the controls do not", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Español" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "¿Con qué necesita ayuda?" })).toBeVisible();
  await page.goto("/guides/update-software");
  await expect(page.getByText("Esta guía no está lista en el idioma que eligió.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Install an update from the device itself" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Empezar esta guía" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start this guide" })).toHaveCount(0);
});
