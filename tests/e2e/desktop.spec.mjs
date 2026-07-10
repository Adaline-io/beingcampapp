import { test, expect } from '@playwright/test';
import { seedEntered } from './helpers.mjs';

/**
 * Desktop web gets a real desktop shell: sidebar navigation + content column,
 * driving the same screens/state as the phone app. The old centered phone
 * presentation stays available at ?frame; design tweaks behind ?debug.
 */
test('desktop first run shows onboarding in a centered card', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Enter the Camp')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.app-desktop')).toBeVisible();
  await expect(page.locator('.app-fullbleed')).toHaveCount(0);
});

test('desktop shell shows sidebar and navigates to the wallet', async ({ context, page }) => {
  await seedEntered(context);
  await page.goto('/');
  await expect(page.getByText('BEINGCAMP', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Start something' })).toBeVisible();
  // Home renders in the content column
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();

  // Sidebar → Wallet (scope to the sidebar; Home also shows a Wallet button)
  const sidebar = page.getByRole('complementary');
  await sidebar.getByRole('button', { name: 'Wallet', exact: true }).click();
  await expect(page.getByText('2,740').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Buy coins/i })).toBeVisible();

  // Sidebar → back Home
  await sidebar.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
});

test('sheets open centered over the desktop shell', async ({ context, page }) => {
  await seedEntered(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start something' }).click();
  await expect(page.getByText(/Start something|Post work|Book a space/i).nth(1)).toBeVisible();
});

test('?frame keeps the phone presentation', async ({ page }) => {
  await page.goto('/?frame');
  await expect(page.getByText('9:41').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.app-desktop')).toHaveCount(0);
});

test('?debug reveals the tweaks panel on desktop', async ({ page }) => {
  await page.goto('/?debug');
  await expect(page.locator('.twk-panel')).toBeVisible({ timeout: 15000 });
});
