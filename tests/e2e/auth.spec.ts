import { test, expect } from "@playwright/test";

const studentEmail = process.env.E2E_STUDENT_EMAIL || "e2e-student@sficusat.test";
const studentPassword = process.env.E2E_PASSWORD_STUDENT || "unset";

async function signIn(page: import("@playwright/test").Page, email = studentEmail, password = studentPassword) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("sign-up screen is usable", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /create your student account/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});

test("sign-in, redirect and sign-out", async ({ page }) => {
  await page.goto("/profile?next=/profile");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fprofile/);
  await signIn(page);
  await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL("/");
});

test("Google OAuth button is present", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
});

test("password reset flow is reachable", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(studentEmail);
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(page.getByText(/check your email|if an account exists/i)).toBeVisible();
});

test("every protected route redirects when signed out", async ({ page }) => {
  const routes = [
    "/dashboard", "/profile", "/resources/upload",
    "/aashraya/coordinator", "/sahayi/assignments", "/admin",
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`/sign-in\\?next=.*${route.replace("/", "\\/")}`));
  }
});

test("student is blocked from coordinator and admin routes", async ({ page }) => {
  await signIn(page);
  for (const route of ["/aashraya/coordinator", "/sahayi/assignments", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/forbidden/);
  }
});

test("aashraya coordinator is allowed into coordinator route", async ({ page }) => {
  const email = process.env.E2E_AASHRAYA_EMAIL || "e2e-aashraya@sficusat.test";
  const password = process.env.E2E_PASSWORD_AASHRAYA || "unset";
  await signIn(page, email, password);
  await page.goto("/aashraya/coordinator");
  await expect(page).not.toHaveURL(/\/forbidden/);
  await expect(page).not.toHaveURL(/\/sign-in/);
});
