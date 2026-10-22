import { expect, test } from "@playwright/test";

const debtor = { studentId: "10000000-0000-4000-8000-000000000001", name: "Ali", phone: "+998901234567", groupName: "English A1", monthlyFee: "500000.00", paidTotal: "300000.00", debt: "200000.00" };

test("debtor report displays month, exact amounts and payment link", async ({ page }) => {
  await page.route(/\/debtors\?month=/, route => {
    const month = new URL(route.request().url()).searchParams.get("month") ?? "";
    return route.fulfill({ json: { data: { month, debtors: [debtor] } } });
  });
  await page.goto("/");
  await expect(page.getByLabel("Hisoblanadigan oy")).toHaveValue(/\d{4}-\d{2}/);
  await expect(page.getByRole("heading", { name: "Ali" })).toBeVisible();
  await expect(page.getByText("200 000,00 so‘m").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Qarzdorlik hisoboti" }).getByRole("link", { name: "To‘lov kiritish", exact: true })).toHaveAttribute("href", `/payments/new?studentId=${debtor.studentId}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("latest selected month wins after a slower older request", async ({ page }) => {
  await page.route(/\/debtors\?month=/, async route => {
    const month = new URL(route.request().url()).searchParams.get("month") ?? "";
    if (month === "2024-01") await new Promise(resolve => setTimeout(resolve, 700));
    const name = month === "2024-01" ? "January student" : month === "2024-02" ? "February student" : "No student";
    try { await route.fulfill({ json: { data: { month, debtors: month.startsWith("2024-") ? [{ ...debtor, name }] : [] } } }); }
    catch { /* The dashboard cancels the stale browser request. */ }
  });
  await page.goto("/");
  const month = page.getByLabel("Hisoblanadigan oy");
  await month.fill("2024-01");
  await page.waitForTimeout(50);
  await month.fill("2024-02");
  await expect(page.getByRole("heading", { name: "February student" })).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.getByRole("heading", { name: "February student" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "January student" })).toHaveCount(0);
});

test("debtors screen retries a failed GET and shows the empty state", async ({ page }) => {
  let calls = 0;
  let retryRequested = false;
  await page.route(/\/debtors\?month=/, route => {
    calls++;
    return retryRequested ? route.fulfill({ json: { data: { month: new URL(route.request().url()).searchParams.get("month"), debtors: [] } } }) : route.fulfill({ status: 503, json: { error: { code: "DATABASE_UNAVAILABLE", message: "Baza vaqtincha mavjud emas." } } });
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Qarzdorlik hisoboti" }).getByRole("alert")).toContainText("Baza vaqtincha mavjud emas.");
  const beforeRetry = calls;
  retryRequested = true;
  await page.getByRole("button", { name: "Qayta urinish" }).click();
  await expect(page.getByText("Ushbu oyda qarzdorlar yo‘q.")).toBeVisible();
  expect(calls).toBe(beforeRetry + 1);
});

test("clearing the month shows an inline validation message without requesting the API", async ({ page }) => {
  let calls = 0;
  await page.route(/\/debtors\?month=/, route => {
    calls++;
    return route.fulfill({ json: { data: { month: new URL(route.request().url()).searchParams.get("month"), debtors: [] } } });
  });
  await page.goto("/");
  const month = page.getByLabel("Hisoblanadigan oy");
  await month.fill("");
  await expect(month).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Hisobotni ko‘rish uchun oy tanlang.")).toBeVisible();
  expect(calls).toBeGreaterThanOrEqual(1);
});
