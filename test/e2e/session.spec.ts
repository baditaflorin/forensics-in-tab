import { expect, test } from '@playwright/test';

test('restores the last case after reload when persistence is enabled', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Load Sample' }).click();
  await expect(page.getByRole('button', { name: /sample-memory\.bin/i })).toBeVisible();

  await page.reload();

  await expect(page.getByText(/Restored the last saved case from this browser\./)).toBeVisible();
  await expect(page.getByRole('button', { name: /sample-memory\.bin/i })).toBeVisible();
});
