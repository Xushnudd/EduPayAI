import { test, expect } from "@playwright/test";
const student = { id: "10000000-0000-4000-8000-000000000001", name: "Ali", phone: "+998901234567", groupName: "English A1", monthlyFee: "500000.00" };
test("detail prefill, tariff warning and safe dialog cancel", async ({ page }) => {
  let deletions = 0;
  await page.route(`**/api/students/${student.id}`, route => { if (route.request().method() === "DELETE") deletions++; return route.fulfill({ json: { data: student } }); });
  await page.goto(`/students/${student.id}`);
  await expect(page.getByLabel("Ism", { exact: true })).toHaveValue("Ali");
  await expect(page.getByText(/oldingi oylarning qarzi/)).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "To‘lov kiritish", exact: true })).toHaveAttribute("href", `/payments/new?studentId=${student.id}`);
  const trigger = page.getByRole("button", { name: "O‘quvchini o‘chirish", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bekor qilish" })).toBeFocused();
  await expect(page.getByText(/barcha to‘lovlar tarixi o‘chiriladi/)).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).not.toBeVisible(); await expect(trigger).toBeFocused();
  await trigger.click(); await page.getByRole("button", { name: "Bekor qilish" }).click();
  expect(deletions).toBe(0); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
