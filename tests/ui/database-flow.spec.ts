import { expect, test } from "@playwright/test";
import { todayTashkent } from "../../src/lib/dates";

test("real browser flow writes and reads only the isolated PostgreSQL test database", async ({ page }) => {
  const name = `Browser ${crypto.randomUUID()}`;
  let studentId: string | undefined;
  try {
    await page.goto("/students");
    await page.getByLabel("Ism", { exact: true }).fill(name);
    await page.getByLabel("Telefon", { exact: true }).fill("+998901234568");
    await page.getByLabel("Guruh", { exact: true }).fill("Browser integration");
    await page.getByLabel("Oylik to‘lov (so‘m)", { exact: true }).fill("500000");
    const createdResponse = page.waitForResponse(response => response.url().endsWith("/api/students") && response.request().method() === "POST");
    await page.getByRole("button", { name: "O‘quvchi qo‘shish", exact: true }).click();
    const created = await (await createdResponse).json() as { data: { id: string } };
    studentId = created.data.id;
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page.getByText("Hozircha to‘lovlar kiritilmagan.")).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "To‘lov kiritish", exact: true }).click();
    await page.getByLabel("Summa (so‘m)").fill("300000");
    await page.getByRole("button", { name: "To‘lovni saqlash" }).click();
    await expect(page.getByText("To‘lov saqlandi.", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "O‘quvchi sahifasi" }).click();
    const today = todayTashkent();
    await expect(page.getByText(`${today.slice(8, 10)}.${today.slice(5, 7)}.${today.slice(0, 4)}`)).toBeVisible();
    await expect(page.getByText("300 000,00 so‘m")).toBeVisible();

    await page.getByRole("link", { name: "Qarzdorlar", exact: true }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByText("200 000,00 so‘m").first()).toBeVisible();
  } finally {
    if (studentId) {
      await page.request.delete(`/api/students/${studentId}`).catch(() => undefined);
    }
  }
});
