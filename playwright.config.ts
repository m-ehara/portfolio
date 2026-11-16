import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/vrt",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  snapshotPathTemplate: "{testDir}/snapshots/{testFileName}/{arg}{ext}",
  updateSnapshots: "missing",
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 0,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run build && pnpm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
