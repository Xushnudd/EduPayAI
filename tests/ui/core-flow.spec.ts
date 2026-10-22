import { expect, test } from "@playwright/test";
import { todayTashkent } from "../../src/lib/dates";

test("mobile and desktop student-to-payment-to-debt workflow", async ({ page }) => {
  const studentId = "10000000-0000-4000-8000-000000000001";
  let student: { id: string; name: string; phone: string; groupName: string; monthlyFee: string } | null = null;
  const payments: { id: string; studentId: string; amount: string; paidOn: string }[] = [];

  await page.route("**/api/students**", async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    if (url.pathname === "/api/students" && method === "GET") return route.fulfill({ json: { data: student ? [student] : [] } });
    if (url.pathname === "/api/students" && method === "POST") {
      const body = route.request().postDataJSON() as Omit<NonNullable<typeof student>, "id">;
      student = { ...body, id: studentId };
      return route.fulfill({ status: 201, json: { data: student } });
    }
    if (url.pathname === `/api/students/${studentId}/payments` && method === "GET") return route.fulfill({ json: { data: [...payments] } });
    if (url.pathname === `/api/students/${studentId}` && method === "GET") return route.fulfill(student ? { json: { data: student } } : { status: 404, json: { error: { message: "O‘quvchi topilmadi." } } });
    if (url.pathname === `/api/students/${studentId}` && method === "PATCH") {
      student = { ...student!, ...(route.request().postDataJSON() as Partial<NonNullable<typeof student>>) };
      return route.fulfill({ json: { data: student } });
    }
    if (url.pathname === `/api/students/${studentId}` && method === "DELETE") {
      student = null; payments.splice(0);
      return route.fulfill({ status: 204, body: "" });
    }
    return route.fallback();
  });
  await page.route("**/api/payments", route => {
    const body = route.request().postDataJSON() as { studentId: string; amount: string; paidOn: string };
    const payment = { ...body, id: "payment-1" };
    payments.push(payment);
    return route.fulfill({ status: 201, json: { data: payment } });
  });
  await page.route(/\/debtors\?month=/, route => {
    const month = new URL(route.request().url()).searchParams.get("month") ?? "";
    const paidTotal = payments.filter(payment => payment.paidOn.startsWith(`${month}-`)).reduce((total, payment) => total + Number(payment.amount), 0);
    const fee = Number(student?.monthlyFee ?? "0");
    const debtors = student && fee > paidTotal ? [{ studentId, name: student.name, phone: student.phone, groupName: student.groupName, monthlyFee: student.monthlyFee, paidTotal: paidTotal.toFixed(2), debt: (fee - paidTotal).toFixed(2) }] : [];
    return route.fulfill({ json: { data: { month, debtors } } });
  });

  await page.goto("/students");
  await page.getByLabel("Ism", { exact: true }).fill("Dilnoza");
  await page.getByLabel("Telefon", { exact: true }).fill("+998901234567");
  await page.getByLabel("Guruh", { exact: true }).fill("Matematika");
  await page.getByLabel("Oylik to‘lov (so‘m)", { exact: true }).fill("500000");
  await page.getByRole("button", { name: "O‘quvchi qo‘shish", exact: true }).click();
  await page.getByRole("link", { name: /Dilnoza/ }).click();
  await expect(page.getByRole("heading", { name: "Dilnoza" })).toBeVisible();
  await page.getByLabel("Oylik to‘lov (so‘m)", { exact: true }).fill("600000");
  await page.getByRole("button", { name: "O‘zgarishlarni saqlash", exact: true }).click();
  await expect(page.getByText(/Ma’lumot saqlandi/)).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "To‘lov kiritish", exact: true }).click();
  await expect(page.getByLabel("O‘quvchi", { exact: true })).toHaveValue(studentId);
  await page.getByLabel("Summa (so‘m)").fill("200000");
  await page.getByRole("button", { name: "To‘lovni saqlash" }).click();
  await expect(page.getByText("To‘lov saqlandi.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "O‘quvchi sahifasi" }).click();
  await expect(page.getByText(`${todayTashkent().slice(8, 10)}.${todayTashkent().slice(5, 7)}.${todayTashkent().slice(0, 4)}`)).toBeVisible();
  await expect(page.getByText("200 000,00 so‘m")).toBeVisible();
  await page.getByRole("link", { name: "Qarzdorlar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dilnoza" })).toBeVisible();
  await expect(page.getByText("400 000,00 so‘m").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "O‘quvchilar", exact: true }).click();
  await page.getByRole("link", { name: /Dilnoza/ }).click();
  await page.getByRole("button", { name: "O‘quvchini o‘chirish", exact: true }).click();
  await page.getByRole("button", { name: "Ha, o‘chirish", exact: true }).click();
  await expect(page.getByRole("heading", { name: "O‘quvchilar", exact: true })).toBeVisible();
  await expect(page.getByText(/Hozircha o‘quvchilar yo‘q/)).toBeVisible();
});
