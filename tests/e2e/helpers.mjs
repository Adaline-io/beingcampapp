import { expect } from '@playwright/test';

/**
 * Seed a returning demo member so tests skip onboarding (rich demo data).
 * Init scripts run on EVERY navigation, so only seed when storage is empty —
 * otherwise a reload would wipe state the test just created.
 */
export async function seedEntered(context) {
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem('beingcamp_v3')) {
        localStorage.setItem('beingcamp_v3', JSON.stringify({ entered: true }));
      }
    } catch (e) {
      /* storage unavailable — test will surface it */
    }
  });
}

/** Open the app and wait for the home dashboard. */
export async function openHome(page) {
  await page.goto('/');
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15000 });
}

/** Current BeingCoin balance as shown in the wallet chip (first match). */
export async function readBalance(page) {
  const txt = await page
    .locator('button', { hasText: /^[\d,]+$/ })
    .first()
    .innerText();
  return parseInt(txt.replace(/[^\d]/g, ''), 10);
}

/** Tap works on both touch (phone project) and mouse (desktop). */
export async function tap(locator) {
  try {
    await locator.tap();
  } catch {
    await locator.click();
  }
}
