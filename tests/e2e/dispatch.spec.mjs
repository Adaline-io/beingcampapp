import { test, expect } from '@playwright/test';
import { seedEntered, openHome, tap } from './helpers.mjs';

/**
 * The dispatch loop: crew calls are claimable seats on posted work (Uber-style),
 * claiming opens a member workspace, and clients get a read-only progress page
 * via a share-token link.
 */
test('crew calls are listed and claiming a seat opens a workspace', async ({ page, context }) => {
  await seedEntered(context);
  await openHome(page);
  await tap(page.getByText('Projects', { exact: true }).last());
  await tap(page.getByText(/Find work/i).first());
  await expect(page.getByText(/Crew calls/i).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Café ordering site').first()).toBeVisible();

  // Claim the frontend seat → it leaves the feed and a workspace appears.
  await tap(page.getByRole('button', { name: 'Join as Frontend dev' }).first());
  await expect(page.getByText(/You're on the crew/i)).toBeVisible({ timeout: 8000 });
  await tap(page.getByText(/My projects/i).first());
  await expect(page.getByText('Café ordering site').first()).toBeVisible();
});

test('client link renders the read-only progress page', async ({ page }) => {
  await page.goto('/?client=demo');
  await expect(page.getByText('Client view')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Café rebrand — Fort Kochi')).toBeVisible();
  await expect(page.getByText('Concept directions')).toBeVisible();
  await expect(page.getByText(/seats filled/i)).toBeVisible();
});

test('the profile shows a track record section', async ({ page, context }) => {
  await seedEntered(context);
  await openHome(page);
  await tap(page.getByText('You', { exact: true }).last());
  await expect(page.getByText('Track record').first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/delivered/i).first()).toBeVisible();
});

test('an invalid client token shows the inactive-link notice', async ({ page }) => {
  await page.goto('/?client=00000000-0000-0000-0000-000000000000');
  await expect(page.getByText(/link isn't active/i)).toBeVisible({ timeout: 15000 });
});
