import { test, expect } from '@playwright/test';
import { tap } from './helpers.mjs';

/**
 * The full first-run journey a walk-in member takes:
 * Splash → phone number → OTP → path fork → profile setup → initiation → home.
 */
test('a new member can onboard end-to-end and lands on home', async ({ page }) => {
  await page.goto('/');

  // Splash
  await tap(page.getByText('Enter the Camp'));

  // Phone number via the in-app keypad
  await expect(page.getByText(/Step 01/i)).toBeVisible();
  for (const d of '9876543210') await tap(page.getByText(d, { exact: true }).first());
  await tap(page.getByText('Send code'));

  // OTP (demo accepts any 4 digits)
  await expect(page.getByText(/Step 02/i)).toBeVisible();
  for (const d of '1234') await tap(page.getByText(d, { exact: true }).first());

  // Path fork
  await expect(page.getByText(/WHAT BRINGS/i)).toBeVisible();
  await tap(page.getByText(/I.LL DO THE WORK/i).first());

  // Profile setup: name → city/headline → skills+bio
  await page.locator('input').first().fill('Test Maker');
  await tap(page.getByRole('button', { name: 'Continue' }));
  await page.locator('input').first().fill('Kochi, Kerala');
  await tap(page.getByRole('button', { name: 'Continue' }));
  await tap(page.getByRole('button', { name: 'Branding' }));
  await tap(page.getByRole('button', { name: 'Finish setup' }));

  // Initiation (two stages) → home
  await tap(page.getByRole('button', { name: 'Complete Initiation' }));
  await tap(page.getByRole('button', { name: 'Enter BeingCamp' }));
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Test Maker').first()).toBeVisible();
});

test('onboarding requires a name before continuing', async ({ page }) => {
  await page.goto('/');
  await tap(page.getByText('Enter the Camp'));
  for (const d of '9876543210') await tap(page.getByText(d, { exact: true }).first());
  await tap(page.getByText('Send code'));
  for (const d of '1234') await tap(page.getByText(d, { exact: true }).first());
  await tap(page.getByText(/I.LL DO THE WORK/i).first());

  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
});
