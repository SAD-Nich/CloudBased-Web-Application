import { test, expect } from "@playwright/test";

test("Escape room page loads", async ({ page }) => {
  await page.goto("/escape-room");
  await expect(page.getByRole("heading", { name: "Code Vault (Easy)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stage 1 — Format the Function" })).toBeVisible();
});
