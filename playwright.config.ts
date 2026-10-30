import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the production build served under the same
 * subpath GitHub Pages uses. Set E2E_SKIP_BUILD=1 to reuse an existing dist/
 * (CI builds once, then runs the tests against that exact artifact).
 */
const trimmed = (process.env.BASE_PATH ?? '/java-inside-out/').replace(/^\/+|\/+$/g, '');
const BASE = trimmed ? `/${trimmed}/` : '/';
const PORT = Number(process.env.E2E_PORT ?? 4173);
const serve = `node scripts/serve-pages.mjs --dir dist --base ${BASE} --port ${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD ? serve : `npm run build && ${serve}`,
    env: { BASE_PATH: BASE },
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
