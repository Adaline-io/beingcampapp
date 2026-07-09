import { test, expect } from '@playwright/test';
import { seedEntered, openHome, tap } from './helpers.mjs';

/**
 * Community surfaces: showcase publishing, zone check-ins (the space loop),
 * programs/RSVPs and notifications.
 */
test.beforeEach(async ({ context, page }) => {
  await seedEntered(context);
  await openHome(page);
});

test('publishing to the showcase adds a publication', async ({ page }) => {
  await tap(page.getByText('Showcase', { exact: true }).last());
  await tap(page.getByRole('button', { name: 'Publish' }).first());
  await tap(page.getByRole('button', { name: /Publish to Showcase/ }));
  await expect(page.getByText(/My new|— case study/i).first()).toBeVisible({ timeout: 8000 });
});

test('zone check-in completes and shows a confirmation', async ({ page }) => {
  await tap(page.getByText('Zones', { exact: true }).first());
  await expect(page.getByText(/Scan to enter/i)).toBeVisible();
  // Zone rows are buttons listing name + cost; open the first
  await tap(page.locator('button').filter({ hasText: /BC|free/i }).first());
  const cta = page.getByRole('button', { name: /Check in/i });
  await expect(cta).toBeVisible();
  await tap(cta);
  await tap(page.getByRole('button', { name: 'Done' }));
  // Back on the zones screen after the sheet closes
  await expect(page.getByText(/Scan to enter/i)).toBeVisible();
});

test('programs list renders workshops', async ({ page }) => {
  await tap(page.getByText('Programs', { exact: true }).first());
  await expect(page.getByText(/host a program|workshops/i).first()).toBeVisible({ timeout: 8000 });
});

test('notifications open and can be marked read', async ({ page }) => {
  await tap(page.getByRole('button', { name: 'Notifications' }));
  await expect(page.getByText(/Mark read/i)).toBeVisible();
  await tap(page.getByRole('button', { name: 'Mark read' }));
});
