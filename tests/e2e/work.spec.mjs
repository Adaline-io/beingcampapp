import { test, expect } from '@playwright/test';
import { seedEntered, openHome, tap } from './helpers.mjs';

/**
 * The work loop: project list, the workspace with escrow milestones,
 * and open work in the Pool.
 */
test.beforeEach(async ({ context, page }) => {
  await seedEntered(context);
  await openHome(page);
});

test('projects tab lists seeded workspaces', async ({ page }) => {
  await tap(page.getByText('Projects', { exact: true }).last());
  await expect(page.getByText('Brew Theory — Launch Posters')).toBeVisible();
  await expect(page.getByText('My Café Rebrand')).toBeVisible();
});

test('a workspace shows escrow and milestones', async ({ page }) => {
  await tap(page.getByText('Projects', { exact: true }).last());
  await tap(page.getByText('Brew Theory — Launch Posters'));
  await expect(page.getByText(/escrow/i).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/milestone/i).first()).toBeVisible();
});

test('open work in the pool is browsable', async ({ page }) => {
  await tap(page.getByText('Projects', { exact: true }).last());
  await tap(page.getByText(/Find work/i).first());
  await expect(page.getByText('Identity for a Calicut café')).toBeVisible({ timeout: 8000 });
});
