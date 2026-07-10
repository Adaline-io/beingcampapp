import { defineConfig, devices } from '@playwright/test';

/**
 * E2E functional suite for the BeingCamp prototype.
 *
 *   npm run test:e2e          # runs against a fresh production build
 *
 * The app is phone-first, so the primary project emulates a phone (full-bleed
 * mode); a small desktop project covers the framed presentation + ?debug panel.
 *
 * CHROMIUM_PATH lets environments with a pre-installed browser skip the
 * `playwright install` download (e.g. PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 sandboxes).
 */
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: { executablePath },
  },
  webServer: {
    // VITE_FORCE_LOCAL keeps the test build in demo mode so E2E runs (locally
    // and in CI) never create users or rows in the production database.
    command:
      'VITE_FORCE_LOCAL=1 npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'phone',
      testIgnore: /desktop\.spec\.mjs/,
      use: {
        ...devices['iPhone 13'],
        // devices[] pins a branded channel; we run stock chromium
        defaultBrowserType: 'chromium',
        browserName: 'chromium',
        launchOptions: { executablePath },
      },
    },
    {
      name: 'desktop',
      testMatch: /desktop\.spec\.mjs/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1400, height: 1000 },
        launchOptions: { executablePath },
      },
    },
  ],
});
