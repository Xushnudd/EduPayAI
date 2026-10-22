import { test, expect } from "@playwright/test";
test("navigation fits and keyboard focus is visible", async ({ page }) => {
  await page.route(/\/debtors\?month=/, route => route.fulfill({ json: { data: { month: new URL(route.request().url()).searchParams.get("month"), debtors: [] } } }));
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.getByRole("link", { name: "Qarzdorlar", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Asosiy qismga o‘tish" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
