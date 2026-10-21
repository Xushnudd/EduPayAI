import { test, expect } from "@playwright/test";
import { todayTashkent } from "../../src/lib/dates";
const student = { id: "10000000-0000-4000-8000-000000000001", name: "Ali", phone: "+998901234567", groupName: "English A1", monthlyFee: "500000.00" };
test("payment preselection, date, validation and pending submission", async ({ page }) => {
  await page.route("**/api/students", route => route.fulfill({ json: { data: [student] } }));
  let posts = 0;
  let finish: (() => void) | undefined;
  await page.route("**/api/payments", async route => { posts++; await new Promise<void>(resolve => { finish = resolve; }); await route.fulfill({ status: 201, json: { data: { id: "payment" } } }); });
  await page.goto(`/payments/new?studentId=${student.id}`);
  await expect(page.getByLabel("O‘quvchi", { exact: true })).toHaveValue(student.id);
  await expect(page.getByLabel("To‘lov sanasi")).toHaveValue(todayTashkent());
  const amount = page.getByLabel("Summa (so‘m)"); await expect(amount).toHaveAttribute("inputmode","decimal");
  await amount.fill("1.001"); await page.getByRole("button", { name:"To‘lovni saqlash" }).click();
  await expect(amount).toHaveAttribute("aria-invalid","true"); expect(posts).toBe(0);
  await amount.fill("100.10"); await page.getByRole("button", { name:"To‘lovni saqlash" }).click();
  await expect(page.getByRole("button", { name:"Saqlanmoqda…" })).toBeDisabled();
  await expect.poll(() => posts).toBe(1); finish!();
  await expect(page.getByText("To‘lov saqlandi.", { exact:true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("empty student list offers creation", async ({ page }) => {
  await page.route("**/api/students", route => route.fulfill({ json: { data: [] } }));
  await page.goto("/payments/new"); await expect(page.getByText(/avval o‘quvchi qo‘shing/)).toBeVisible();
  await expect(page.getByRole("link", { name:"O‘quvchi qo‘shish",exact:true })).toHaveAttribute("href","/students");
});
