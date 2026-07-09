import { test, expect } from '@playwright/test';

/**
 * Desktop web keeps the centered phone presentation; design tweaks are
 * development chrome behind ?debug.
 */
test('desktop shows the framed presentation without tweaks', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('9:41').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.app-fullbleed')).toHaveCount(0);
  await expect(page.locator('.twk-panel')).toHaveCount(0);
});

test('?debug reveals the tweaks panel on desktop', async ({ page }) => {
  await page.goto('/?debug');
  await expect(page.locator('.twk-panel')).toBeVisible({ timeout: 15000 });
});
