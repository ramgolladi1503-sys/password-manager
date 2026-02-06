import { test, expect } from "@playwright/test";

test("desktop navigation shows core data", async ({ page }) => {
  await page.goto("/");

  const setupHeading = page.getByRole("heading", { name: "Create your master key" });
  const unlockHeading = page.getByRole("heading", { name: "Unlock your vault" });

  if (await setupHeading.isVisible()) {
    await page.getByLabel("Master password").fill("TestVault#1234");
    await page.getByLabel("Confirm password").fill("TestVault#1234");
    await page.getByRole("button", { name: "Create vault" }).click();
  } else if (await unlockHeading.isVisible()) {
    await page.getByLabel("Master password").fill("TestVault#1234");
    await page.getByRole("button", { name: "Unlock vault" }).click();
  }

  await expect(page.getByText("Rotation Dashboard")).toBeVisible();

  await page.locator(".nav-items").getByRole("button", { name: "Vault" }).click();
  await expect(page.getByText("acme-mail.example")).toBeVisible();

  await page.locator(".nav-items").getByRole("button", { name: "Queue" }).click();
  const screen = page.locator("section.screen");
  await expect(screen.getByRole("button", { name: "Rotate All" }).first()).toBeVisible();

  await page.locator(".nav-items").getByRole("button", { name: "Risk" }).click();
  await expect(page.getByText("Risk Heatmap")).toBeVisible();
});
