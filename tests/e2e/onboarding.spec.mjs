import { test, expect } from '@playwright/test';
import { tap } from './helpers.mjs';

/**
 * The full first-run journey a walk-in member takes — name-only sign-in:
 * Splash → path fork → profile setup → initiation → home.
 */
test('a new member can onboard end-to-end and lands on home', async ({ page }) => {
  await page.goto('/');

  // Splash → straight to the path fork (no phone / OTP — your name is enough).
  await tap(page.getByText('Enter the Camp'));

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
  await tap(page.getByText(/I.LL DO THE WORK/i).first());

  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
});
