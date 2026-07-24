import { test, expect } from '@playwright/test';
import { seedEntered, openHome } from './helpers.mjs';

/**
 * Standalone legal pages (no account needed) and the zone QR deep-link
 * check-in (?checkin=<zoneId>) that a printed QR opens.
 */
test('the Terms page renders standalone', async ({ page }) => {
  await page.goto('/?legal=terms');
  await expect(page.getByText('TERMS OF USE', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/closed-loop utility credit/i)).toBeVisible();
});

test('the Privacy page renders standalone', async ({ page }) => {
  await page.goto('/?legal=privacy');
  await expect(page.getByText('PRIVACY POLICY', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/only what the community needs/i)).toBeVisible();
});

test('a zone QR deep-link checks the member in', async ({ page, context }) => {
  await seedEntered(context);
  // Opening the app with ?checkin=<zone> mimics scanning a printed zone QR.
  await page.goto('/?checkin=camp');
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Checked in/i)).toBeVisible({ timeout: 8000 });
});
