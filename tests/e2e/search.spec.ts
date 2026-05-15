import { test, expect } from '@playwright/test';

test('search finds a company by partial name', async ({ page }) => {
  await page.goto('/en/search?q=fanu');
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#search')).toContainText(/FANUC/i, { timeout: 10_000 });
});
