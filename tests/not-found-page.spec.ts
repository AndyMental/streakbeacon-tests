import { expect, type Page, test } from '@playwright/test';

const baseUrlEnv = 'STREAKBEACON_BASE_URL';

function unknownRoute(): string {
  return `/black-box-not-found-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function expectBrandedNotFoundPage(page: Page): Promise<void> {
  await expect(page.getByText(/streakbeacon/i).first()).toBeVisible();
  await expect(page.getByText(/not found|404|missing|could not find|couldn't find/i).first()).toBeVisible();
}

test.describe('Not found page', () => {
  test.skip(!process.env[baseUrlEnv], `Missing required black-box app input: ${baseUrlEnv}`);

  test('visitor opens an unknown route', async ({ page }) => {
    await page.goto(unknownRoute());

    await expectBrandedNotFoundPage(page);
    await expect(page.getByRole('link', { name: /home|go back|return|streakbeacon/i })).toBeVisible();
  });

  test('visitor returns home from the not found page', async ({ page }) => {
    await page.goto(unknownRoute());

    await expectBrandedNotFoundPage(page);
    await page.getByRole('link', { name: /home|go back|return|streakbeacon/i }).click();

    await expect(page).toHaveURL(/\/(?:#.*)?$/);
    await expect(page.getByRole('main').or(page.locator('body'))).toBeVisible();
  });
});
