import { test, expect } from "@playwright/test";
const student = { id: "10000000-0000-4000-8000-000000000001", name: "Ali", phone: "+998901234567", groupName: "English A1", monthlyFee: "500000.00" };
test("student list, labels and validation fit", async ({ page }) => {
  await page.route("**/api/students", route => route.fulfill({ json: { data: [student] } }));
  await page.goto("/students");
  await expect(page.getByRole("link", { name: /Ali/ })).toHaveAttribute("href", `/students/${student.id}`);
  for (const label of ["Ism", "Telefon", "Guruh", "Oylik to‘lov (so‘m)"]) await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "O‘quvchi qo‘shish", exact: true }).click();
  await expect(page.getByLabel("Ism", { exact: true })).toHaveAttribute("aria-invalid", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("empty students state", async ({ page }) => {
  await page.route("**/api/students", route => route.fulfill({ json: { data: [] } }));
  await page.goto("/students"); await expect(page.getByText(/Hozircha o‘quvchilar yo‘q/)).toBeVisible();
});
