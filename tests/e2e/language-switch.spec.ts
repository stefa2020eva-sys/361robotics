import { test, expect } from '@playwright/test';

test('language switcher preserves current page', async ({ page }) => {
  await page.goto('/en/companies/fanuc');
  await page.click('[data-set-lang="ru"]');
  await expect(page).toHaveURL(/\/ru\/companies\/fanuc$/);
  await expect(page.locator('html[lang="ru"]')).toHaveCount(1);
});
