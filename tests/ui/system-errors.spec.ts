import { expect, test } from "@playwright/test";
import { todayTashkent } from "../../src/lib/dates";

const student = { id: "10000000-0000-4000-8000-000000000001", name: "Ali", phone: "+998901234567", groupName: "English A1", monthlyFee: "500000.00" };

test("invalid student URL shows the accessible not-found page", async ({ page }) => {
  await page.goto("/students/not-a-uuid");
  await expect(page.getByRole("heading", { name: "Ma’lumot topilmadi" })).toBeVisible();
  await expect(page.getByRole("link", { name: "O‘quvchilar ro‘yxatiga qaytish" })).toHaveAttribute("href", "/students");
});

test("server field errors stay with their input and values are preserved", async ({ page }) => {
  await page.route("**/api/students", route => route.fulfill({ json: { data: [student] } }));
  await page.route("**/api/payments", route => route.fulfill({ status: 400, json: { error: { code: "VALIDATION_ERROR", message: "Kiritilgan ma’lumotlarni tekshiring.", fields: { amount: "Summa noto‘g‘ri." } } } }));
  await page.goto(`/payments/new?studentId=${student.id}`);
  await page.getByLabel("Summa (so‘m)").fill("100.10");
  await page.getByRole("button", { name: "To‘lovni saqlash" }).click();
  await expect(page.getByLabel("Summa (so‘m)")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Summa noto‘g‘ri.")).toBeVisible();
  await expect(page.getByLabel("Summa (so‘m)")).toHaveValue("100.10");
});

test("uncertain payment POST reports the result and is not retried", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/students", route => route.fulfill({ json: { data: [student] } }));
  await page.route("**/api/payments", route => { posts++; return route.abort(); });
  await page.goto(`/payments/new?studentId=${student.id}`);
  await page.getByLabel("Summa (so‘m)").fill("100.10");
  await page.getByLabel("To‘lov sanasi").fill(todayTashkent());
  await page.getByRole("button", { name: "To‘lovni saqlash" }).click();
  await expect(page.locator('form[aria-label="To‘lov kiritish formasi"]').getByRole("alert")).toContainText("natijasi noma’lum");
  expect(posts).toBe(1);
});
