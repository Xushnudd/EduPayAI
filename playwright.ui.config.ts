import { defineConfig } from "@playwright/test";
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL is required for E2E tests.");
const testDatabase = new URL(testDatabaseUrl);
const testDatabaseName = decodeURIComponent(testDatabase.pathname.slice(1));
if (!/^postgres(?:ql)?:$/.test(testDatabase.protocol) || !testDatabaseName.endsWith("_test")) {
  throw new Error("E2E tests may only use a PostgreSQL database whose name ends with _test.");
}
if (process.env.DATABASE_URL) {
  const appDatabase = new URL(process.env.DATABASE_URL);
  const appDatabaseName = decodeURIComponent(appDatabase.pathname.slice(1));
  if (testDatabase.toString() === appDatabase.toString() || (testDatabase.hostname === appDatabase.hostname && testDatabase.port === appDatabase.port && testDatabaseName === appDatabaseName)) {
    throw new Error("TEST_DATABASE_URL must point to a database separate from DATABASE_URL.");
  }
}

const baseURL = "http://127.0.0.1:3101";
export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,
  workers: 2,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command: `"${process.execPath}" node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3101`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { DATABASE_URL: testDatabaseUrl, NEXT_TELEMETRY_DISABLED: "1" },
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 360, height: 800 } } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
});
