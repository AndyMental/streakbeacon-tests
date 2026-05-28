import { expect, test } from '@playwright/test';

test.describe('StreakBeacon deploy URL placeholder smoke', () => {
  test.skip(
    !process.env.STREAKBEACON_BASE_URL,
    'STREAKBEACON_BASE_URL must be set to the deployed Vercel URL.'
  );

  test('landing page loads and has a non-empty title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });
});
