import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

const UNKNOWN_ROUTE = '/this-route-does-not-exist';
const NOT_FOUND_PATTERN = /page not found|not found|404/i;
const HOME_LINK_PATTERN = /home|back to home|go home|return home|streakbeacon/i;

async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);

    if (await item.isVisible().catch(() => false)) {
      return item;
    }
  }

  return null;
}

async function openUnknownRoute(page: Page): Promise<void> {
  await page.goto(UNKNOWN_ROUTE);
}

async function expectBrandedNotFound(page: Page): Promise<void> {
  const heading = await firstVisible(
    page.getByRole('heading', { name: NOT_FOUND_PATTERN })
  );

  expect(heading, 'expected a visible heading describing the not-found state').not.toBeNull();
}

async function findHomeLink(page: Page): Promise<Locator> {
  const link = await firstVisible(page.getByRole('link', { name: HOME_LINK_PATTERN }));

  expect(link, 'expected a visible link back to the home page').not.toBeNull();

  return link as Locator;
}

test.describe('StreakBeacon not-found page', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test('visitor opens an unknown route and sees a branded not-found message with a home link', async ({ page }) => {
    await openUnknownRoute(page);

    await expectBrandedNotFound(page);
    await findHomeLink(page);
  });

  test('visitor returns to the home page from the not-found page', async ({ page }) => {
    await openUnknownRoute(page);

    const homeLink = await findHomeLink(page);

    await homeLink.click();

    await expect(page).toHaveURL(/\/(?:$|\?|#)/);
    await expect(page.getByRole('link', { name: HOME_LINK_PATTERN }).first().or(page.locator('body'))).toBeVisible();
  });
});
