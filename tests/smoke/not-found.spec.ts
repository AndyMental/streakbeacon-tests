import { expect, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

test.describe('StreakBeacon not-found smoke', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test('unknown route renders the branded not-found page with a link back home', async ({ page }) => {
    const nonce = `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await page.goto(`/__definitely_not_a_real_route__/${nonce}`);

    expect(response?.status() ?? 404).toBe(404);

    await expect(page.getByRole('heading', { name: /not found|page not found/i })).toBeVisible();

    const homeLink = page
      .locator('[data-testid="not-found-home-link"]')
      .or(page.getByRole('link', { name: /home|back to home|go home/i }));

    await expect(homeLink).toBeVisible();
  });

  test('home link from the not-found page returns to /', async ({ page, baseURL }) => {
    const nonce = `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await page.goto(`/__definitely_not_a_real_route__/${nonce}`);

    const homeLink = page
      .locator('[data-testid="not-found-home-link"]')
      .or(page.getByRole('link', { name: /home|back to home|go home/i }));

    await expect(homeLink).toBeVisible();

    await Promise.all([page.waitForURL('**/'), homeLink.click()]);

    expect(new URL(page.url()).pathname).toBe('/');
    expect(baseURL).toBeTruthy();
    expect(page.url().startsWith(baseURL as string)).toBeTruthy();
  });
});
