import { test, expect } from '@playwright/test';

test('company page shows highlights, clients, products', async ({ page }) => {
  await page.goto('/en/companies/fanuc');
  await expect(page.locator('h1')).toContainText('FANUC');
  await expect(page.getByText('Highlights')).toBeVisible();
  await expect(page.getByText('Key clients')).toBeVisible();
  await expect(page.getByText('FANUC M-2000iA')).toBeVisible();
  await page.getByRole('link', { name: /Servo Motor/i }).click();
  await expect(page).toHaveURL(/\/components\/servo-motor$/);
  await expect(page.getByText('FANUC').first()).toBeVisible();
});
