import { defineConfig, devices } from "@playwright/test";

// Tests E2E. Requieren la app corriendo + DB sembrada.
// Si pones BASE_URL apuntando a un staging, los tests usan ese.
// Por defecto: levanta `pnpm dev` automáticamente y testea contra :3000.

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // los tests comparten el seed; serializar evita carreras
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // Si no se da BASE_URL, Playwright levanta el dev server.
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
