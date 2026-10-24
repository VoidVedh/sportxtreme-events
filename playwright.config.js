import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.TEST_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.TEST_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173 --host 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 15000,
      },
});
