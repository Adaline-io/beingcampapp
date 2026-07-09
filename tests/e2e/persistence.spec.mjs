import { test, expect } from '@playwright/test';
import { seedEntered, openHome, tap } from './helpers.mjs';

/**
 * State must survive a reload (localStorage in demo mode; the same contract
 * the Supabase bridge fulfills in live mode).
 */
test('a purchase survives a full page reload', async ({ context, page }) => {
  await seedEntered(context);
  await openHome(page);

  await tap(page.locator('button', { hasText: /^[\d,]+$/ }).first());
  await tap(page.getByRole('button', { name: /Buy coins/i }));
  const payBtn = page.getByRole('button', { name: /Pay ₹.*get/ });
  const coins = parseInt(
    (await payBtn.innerText()).match(/get ([\d,]+) BC/)[1].replace(/,/g, ''),
    10
  );
  await tap(payBtn);
  await tap(page.getByRole('button', { name: /with Razorpay/ }));
  await tap(page.getByRole('button', { name: 'Done' }));

  // Back on the wallet, the credited balance shows
  await tap(page.getByRole('button', { name: 'Back' }));
  const expected = (2740 + coins).toLocaleString('en-IN');
  await expect(page.getByText(expected).first()).toBeVisible({ timeout: 8000 });

  await page.reload();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(expected).first()).toBeVisible();
});

test('sign out returns to the splash', async ({ context, page }) => {
  await seedEntered(context);
  await openHome(page);
  await tap(page.getByText('You', { exact: true }).last());
  const signOut = page.getByText(/Sign out/i).first();
  await signOut.scrollIntoViewIfNeeded().catch(() => {});
  await tap(signOut);
  await expect(page.getByText('Enter the Camp')).toBeVisible({ timeout: 8000 });
});
