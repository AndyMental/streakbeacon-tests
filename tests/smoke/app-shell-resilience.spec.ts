import { expect, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

test.describe('App shell resilience', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test('@smoke @critical @a11y keyboard user skips directly to main content', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();
  });

  test('@critical @a11y keyboard user activates the skip link', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    await skipLink.press('Enter');

    const main = page.getByRole('main');
    await expect(main).toBeFocused();
    await expect
      .poll(() => new URL(page.url()).hash, {
        message: 'browser location should reference the main content target'
      })
      .toMatch(/^#.*main/i);
  });
});
