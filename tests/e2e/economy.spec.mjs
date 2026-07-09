import { test, expect } from '@playwright/test';
import { seedEntered, openHome, tap } from './helpers.mjs';

/**
 * The coin economy: wallet ledger, buying packs, spending in the store,
 * and order tracking. This is the heart of the prototype.
 */
test.beforeEach(async ({ context, page }) => {
  await seedEntered(context);
  await openHome(page);
});

test('wallet shows balance and transaction history', async ({ page }) => {
  await tap(page.locator('button', { hasText: /^[\d,]+$/ }).first());
  await expect(page.getByText('2,740').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Buy coins/i })).toBeVisible();
});

test('buying a coin pack credits the balance and writes a transaction', async ({ page }) => {
  await tap(page.locator('button', { hasText: /^[\d,]+$/ }).first());
  await tap(page.getByRole('button', { name: /Buy coins/i }));

  // Bottom CTA reflects the selected pack: "Pay ₹X · get Y BC"
  const payBtn = page.getByRole('button', { name: /Pay ₹.*get/ });
  await expect(payBtn).toBeVisible();
  const coins = parseInt(
    (await payBtn.innerText()).match(/get ([\d,]+) BC/)[1].replace(/,/g, ''),
    10
  );
  await tap(payBtn);

  // Checkout sheet → simulated Razorpay processing → done
  await tap(page.getByRole('button', { name: /with Razorpay/ }));
  await tap(page.getByRole('button', { name: 'Done' }));

  // Back on the wallet, the new balance and the pack transaction both show
  await tap(page.getByRole('button', { name: 'Back' }));
  const expected = (2740 + coins).toLocaleString('en-IN');
  await expect(page.getByText(expected).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/Maker Pack|Starter Pack|Builder Pack|Chief Pack/).first()).toBeVisible();
});

test('buying a product deducts coins and creates an order', async ({ page }) => {
  await tap(page.getByText('The Store'));
  // Open a seeded product by name (price renders as icon + number, not one text node)
  await tap(page.getByText('Camp Heavyweight Tee').first());
  const buyBtn = page.getByRole('button', { name: /Buy · [\d,]+ BC/ });
  await expect(buyBtn).toBeVisible();
  const price = parseInt((await buyBtn.innerText()).replace(/[^\d]/g, ''), 10);
  await tap(buyBtn);

  await expect(page.getByText(/ORDER CONFIRMED/i)).toBeVisible();
  // Close the sheet, then the store's wallet chip shows the reduced balance
  await tap(page.getByRole('button').filter({ hasText: /Done|Track|orders/i }).first());
  const expected = (2740 - price).toLocaleString('en-IN');
  await expect(page.getByText(expected).first()).toBeVisible({ timeout: 8000 });
});

test('the gift sheet opens from the wallet', async ({ page }) => {
  await tap(page.locator('button', { hasText: /^[\d,]+$/ }).first());
  await tap(page.getByRole('button', { name: /Send · Gift/ }));
  await expect(page.getByText(/Gift BeingCoin/i).first()).toBeVisible();
});
