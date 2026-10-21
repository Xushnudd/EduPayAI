import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./tests/ui", fullyParallel: false, use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" }, projects: [{ name: "mobile", use: { viewport: { width: 360, height: 800 } } }, { name: "desktop", use: { viewport: { width: 1280, height: 800 } } }] });
