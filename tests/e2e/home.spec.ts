import { test, expect } from '@playwright/test';

for (const lang of ['en', 'ru', 'zh'] as const) {
  test(`home renders in ${lang}`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page).toHaveURL(new RegExp(`/${lang}/?$`));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toContainText('361Robotics');
    await expect(page.locator(`html[lang="${lang}"]`)).toHaveCount(1);
    const hreflang = await page.locator('link[rel="alternate"][hreflang]').count();
    expect(hreflang).toBeGreaterThanOrEqual(4);
  });
}
