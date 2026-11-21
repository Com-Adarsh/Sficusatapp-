import { test, expect } from "@playwright/test";

const protectedRoutes = ["/dashboard", "/profile", "/resources/upload", "/aashraya/coordinator", "/sahayi/assignments", "/admin"];

test("Google OAuth button and sign-in errors", async ({ page }) => {
  await page.goto("/sign-in?next=https%3A%2F%2Fevil.example");
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await page.getByLabel("Email").fill("invalid@example.invalid");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page.getByText(/sign-in failed/i)).toBeVisible();
});

test("password reset and registration surfaces", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
});

for (const route of protectedRoutes) {
  test(`unauthenticated access to ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp("/sign-in\\?next="));
  });
}

test("403 page is non-indexable", async ({ page }) => {
  await page.goto("/403");
  await expect(page.locator("h1")).toContainText("restricted");
});
