// Configuración de Playwright para los tests End-to-End (SCRUM-71).
// Arranca el backend (puerto 3000) y el frontend de Angular (puerto 4200) si no están ya
// levantados. MongoDB debe estar en marcha antes con `docker compose up -d`.
import { defineConfig, devices } from '@playwright/test';

const enCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // La comprobación de MongoDB va antes que los servidores (ver e2e/global-setup.ts).
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  // Todos los tests comparten la base de datos de desarrollo: se ejecutan de uno en uno.
  fullyParallel: false,
  workers: 1,
  forbidOnly: enCI,
  retries: enCI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/utils/bd.js comprobar && npm --prefix backend start',
      url: 'http://localhost:3000/api/ping',
      reuseExistingServer: !enCI,
      timeout: 60_000,
    },
    {
      command: 'npm --prefix frontend start',
      url: 'http://localhost:4200',
      reuseExistingServer: !enCI,
      timeout: 180_000,
    },
  ],
});
