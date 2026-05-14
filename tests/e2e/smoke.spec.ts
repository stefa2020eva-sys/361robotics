import { test, expect } from '@playwright/test';

test('placeholder — server boots', async ({ request }) => {
  const res = await request.get('/');
  expect([200, 301, 302, 404]).toContain(res.status());
});
