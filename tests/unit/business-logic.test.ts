import assert from "node:assert/strict";
import test from "node:test";
import { currentMonth, monthRange, todayTashkent } from "../../src/lib/dates";
import { debtAmount, Money, moneyString } from "../../src/lib/money";
import { dateSchema, monthSchema, moneySchema, paymentSchema, studentPatchSchema } from "../../src/lib/validation";

test("decimal arithmetic keeps cents exact and reports positive debts only", () => {
  assert.equal(moneyString(new Money("0.10").plus("0.20")), "0.30");
  assert.equal(debtAmount("500000.00", "300000.00").toFixed(2), "200000.00");
  assert.equal(debtAmount("600000.00", "600000.00").toFixed(2), "0.00");
  assert.equal(debtAmount("450000.00", "500000.00").toFixed(2), "-50000.00");
  assert.equal(moneyString(new Money("999999999999.99").plus("1.00")), "1000000000000.99");
});

test("money, month and payment schemas accept valid inputs and reject boundaries", () => {
  assert.equal(moneySchema.safeParse("999999999999.99").success, true);
  for (const invalid of ["0", "-1", "1.001", "1e3", "1000000000000", "1,000"]) {
    assert.equal(moneySchema.safeParse(invalid).success, false, invalid);
  }
  assert.equal(monthSchema.safeParse("2024-02").success, true);
  for (const invalid of ["2024-00", "2024-13", "0000-01", "24-01"]) {
    assert.equal(monthSchema.safeParse(invalid).success, false, invalid);
  }
  assert.equal(dateSchema.safeParse("2024-02-29").success, true);
  for (const invalid of ["2026-02-29", "2026-04-31", "2026-02-30", "0000-01-01"]) {
    assert.equal(dateSchema.safeParse(invalid).success, false, invalid);
  }
  assert.equal(paymentSchema.safeParse({ studentId: "10000000-0000-4000-8000-000000000001", amount: "10.25", paidOn: "2024-02-29" }).success, true);
  assert.equal(studentPatchSchema.safeParse({}).success, false);
});

test("month ranges include their first day and exclude the next month", () => {
  const february = monthRange("2024-02");
  assert.equal(february.gte.toISOString(), "2024-02-01T00:00:00.000Z");
  assert.equal(february.lt?.toISOString(), "2024-03-01T00:00:00.000Z");
  assert.deepEqual(monthRange("9999-12"), { gte: new Date("9999-12-01T00:00:00.000Z"), lte: new Date("9999-12-31T00:00:00.000Z") });
});

test("current day and month use Asia/Tashkent across UTC midnight", () => {
  const instant = new Date("2026-10-21T19:30:00.000Z");
  assert.equal(todayTashkent(instant), "2026-10-22");
  assert.equal(currentMonth(instant), "2026-10");
});
