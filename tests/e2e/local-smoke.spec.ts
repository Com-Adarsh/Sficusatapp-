import { expect, test } from "@playwright/test";

test("local application boots without hosted Supabase", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).not.toBeEmpty();
});
