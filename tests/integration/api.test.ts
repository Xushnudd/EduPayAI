import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const appDatabaseUrl = process.env.DATABASE_URL;
const testMonth = "2026-07";
let server: ChildProcess | undefined;
let baseURL = "";
let studentId: string | undefined;

function validateTestDatabase(): string {
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL is required.");
  const testUrl = new URL(testDatabaseUrl);
  const testName = decodeURIComponent(testUrl.pathname.slice(1));
  if (!/^postgres(?:ql)?:$/.test(testUrl.protocol) || !testUrl.hostname || !testName.endsWith("_test")) {
    throw new Error("Integration tests require a PostgreSQL database whose name ends with _test.");
  }
  if (appDatabaseUrl) {
    const appUrl = new URL(appDatabaseUrl);
    const appName = decodeURIComponent(appUrl.pathname.slice(1));
    if (testUrl.toString() === appUrl.toString() || (testUrl.hostname === appUrl.hostname && testUrl.port === appUrl.port && testName === appName)) {
      throw new Error("TEST_DATABASE_URL must point to a database separate from DATABASE_URL.");
    }
  }
  return testUrl.toString();
}

async function findPort(): Promise<number> {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const address = listener.address();
  if (!address || typeof address === "string") throw new Error("Could not reserve an integration-test port.");
  const port = address.port;
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
  return port;
}

async function stopServer(): Promise<void> {
  if (!server || server.exitCode !== null) return;
  const child = server;
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

before(async () => {
  const safeUrl = validateTestDatabase();
  const environment = { ...process.env, DATABASE_URL: safeUrl, TEST_DATABASE_URL: safeUrl, NEXT_TELEMETRY_DISABLED: "1" };
  const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env: environment, stdio: "ignore" });
  assert.equal(migration.status, 0, "Could not apply migrations to the isolated test database.");
  const port = await findPort();
  baseURL = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { env: environment, stdio: "ignore" });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("Next.js test server stopped before the API became ready.");
    try {
      const response = await fetch(`${baseURL}/api/students`);
      if (response.ok) return;
    } catch { /* Wait for the dev server and database connection. */ }
    await delay(500);
  }
  await stopServer();
  throw new Error("The integration-test API did not become ready within 60 seconds.");
});

after(async () => {
  if (studentId && baseURL) {
    await fetch(`${baseURL}/api/students/${studentId}`, { method: "DELETE" }).catch(() => undefined);
  }
  await stopServer();
});

test("student, payment, history and debtor API flow uses PostgreSQL", async () => {
  const uniqueName = `Integration ${randomUUID()}`;
  const create = await fetch(`${baseURL}/api/students`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: uniqueName, phone: "+998901234567", groupName: "Integration group", monthlyFee: "500000.00" }),
  });
  assert.equal(create.status, 201);
  const created = await create.json() as { data: { id: string; monthlyFee: string } };
  studentId = created.data.id;
  assert.equal(created.data.monthlyFee, "500000.00");

  const list = await fetch(`${baseURL}/api/students`).then(response => response.json()) as { data: { id: string }[] };
  assert.equal(list.data.some(student => student.id === studentId), true);
  const detail = await fetch(`${baseURL}/api/students/${studentId}`).then(response => response.json()) as { data: { name: string } };
  assert.equal(detail.data.name, uniqueName);
  const noPaymentDebt = await fetch(`${baseURL}/debtors?month=${testMonth}`).then(response => response.json()) as { data: { debtors: { studentId: string; debt: string }[] } };
  assert.equal(noPaymentDebt.data.debtors.find(debtor => debtor.studentId === studentId)?.debt, "500000.00");

  const invalidPayment = await fetch(`${baseURL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, amount: "-1", paidOn: `${testMonth}-10` }) });
  assert.equal(invalidPayment.status, 400);
  const malformedJson = await fetch(`${baseURL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(malformedJson.status, 400);
  for (const paymentInput of [
    { studentId, amount: "100000.00", paidOn: `${testMonth}-10` },
    { studentId, amount: "200000.00", paidOn: `${testMonth}-20` },
    { studentId, amount: "10000.00", paidOn: "2026-08-01" },
  ]) {
    const response = await fetch(`${baseURL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentInput) });
    assert.equal(response.status, 201);
  }
  const history = await fetch(`${baseURL}/api/students/${studentId}/payments`).then(response => response.json()) as { data: { amount: string; paidOn: string }[] };
  assert.equal(history.data.length, 3);
  assert.deepEqual(history.data.map(payment => payment.paidOn), ["2026-08-01", `${testMonth}-20`, `${testMonth}-10`]);
  assert.equal(history.data[2].amount, "100000.00");

  const debtors = await fetch(`${baseURL}/debtors?month=${testMonth}`).then(response => response.json()) as { data: { debtors: { studentId: string; debt: string }[] } };
  assert.equal(debtors.data.debtors.find(debtor => debtor.studentId === studentId)?.debt, "200000.00");
  const patch = await fetch(`${baseURL}/api/students/${studentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyFee: "550000.00" }) });
  assert.equal(patch.status, 200);
  const changedTariff = await fetch(`${baseURL}/debtors?month=${testMonth}`).then(response => response.json()) as { data: { debtors: { studentId: string; debt: string }[] } };
  assert.equal(changedTariff.data.debtors.find(debtor => debtor.studentId === studentId)?.debt, "250000.00");
  await fetch(`${baseURL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, amount: "300000.00", paidOn: `${testMonth}-30` }) });
  const overpaidMonth = await fetch(`${baseURL}/debtors?month=${testMonth}`).then(response => response.json()) as { data: { debtors: { studentId: string }[] } };
  assert.equal(overpaidMonth.data.debtors.some(debtor => debtor.studentId === studentId), false);
  const nextMonth = await fetch(`${baseURL}/debtors?month=2026-08`).then(response => response.json()) as { data: { debtors: { studentId: string; debt: string }[] } };
  assert.equal(nextMonth.data.debtors.find(debtor => debtor.studentId === studentId)?.debt, "540000.00");

  const remove = await fetch(`${baseURL}/api/students/${studentId}`, { method: "DELETE" });
  assert.equal(remove.status, 204);
  studentId = undefined;
  const deletedHistory = await fetch(`${baseURL}/api/students/${created.data.id}/payments`);
  assert.equal(deletedHistory.status, 404);
});
