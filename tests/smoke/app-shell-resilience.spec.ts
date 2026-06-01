import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredBaseUrl = 'STREAKBEACON_BASE_URL';
const delayedPath = process.env.STREAKBEACON_DELAYED_PATH;
const errorPath = process.env.STREAKBEACON_ERROR_PATH;

function missingBaseUrl(): boolean {
  return !process.env[requiredBaseUrl];
}

async function visibleStatus(page: Page): Promise<Locator> {
  const status = page
    .getByRole('status', { name: /loading.*streakbeacon|streakbeacon.*loading/i })
    .or(page.getByRole('status').filter({ hasText: /loading|streakbeacon/i }))
    .first();

  await expect(status).toBeVisible();

  return status;
}

async function errorAlert(page: Page): Promise<Locator> {
  const alert = page
    .getByRole('alert', { name: /streakbeacon|error|problem|failed|wrong/i })
    .or(page.getByRole('alert').filter({ hasText: /streakbeacon|error|problem|failed|wrong/i }))
    .first();

  await expect(alert).toBeVisible();

  return alert;
}

async function resetControl(page: Page): Promise<Locator> {
  const control = page.getByRole('button', { name: /try again|retry|reset/i }).first();

  await expect(control).toBeVisible();

  return control;
}

async function expectFocusInside(page: Page, locator: Locator): Promise<void> {
  await expect
    .poll(async () =>
      locator.evaluate((element) => {
        const activeElement = element.ownerDocument.activeElement;

        return activeElement === element || element.contains(activeElement);
      })
    )
    .toBe(true);
}

async function expectFocusOutside(locator: Locator): Promise<void> {
  await expect
    .poll(async () =>
      locator.evaluate((element) => {
        const activeElement = element.ownerDocument.activeElement;

        return activeElement !== element && !element.contains(activeElement);
      })
    )
    .toBe(true);
}

test.describe('App shell resilience', () => {
  test.skip(missingBaseUrl(), `Missing required black-box test input: ${requiredBaseUrl}`);

  test('visitor sees a branded 404 page and can return home from an unknown route', async ({ page }) => {
    const unknownPath = `/qa-missing-route-${Date.now()}`;
    const response = await page.goto(unknownPath);

    expect(response?.status(), 'unknown routes should return a 404 HTTP status').toBe(404);
    await expect(page.getByText(/404|not found|could not be found|page does not exist/i).first()).toBeVisible();

    const homeLink = page
      .getByRole('link', { name: /home|streakbeacon|dashboard|return|back/i })
      .filter({ hasNotText: /^$/ })
      .first();

    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/\/(?:$|[?#])/);
  });

  test('user sees loading status while app content is pending', async ({ page }) => {
    test.skip(!delayedPath, 'STREAKBEACON_DELAYED_PATH must point to a deployed delayed-content route.');
    expect(delayedPath).toBeTruthy();

    await page.goto(delayedPath);

    const status = await visibleStatus(page);

    await page.keyboard.press('Tab');
    await expectFocusOutside(status);
  });

  test('user can recover from an error fallback', async ({ page }) => {
    test.skip(!errorPath, 'STREAKBEACON_ERROR_PATH must point to a deployed error fallback route.');
    expect(errorPath).toBeTruthy();

    await page.goto(errorPath);

    await errorAlert(page);
    await resetControl(page);
  });

  test('user retries after an error fallback', async ({ page }) => {
    test.skip(!errorPath, 'STREAKBEACON_ERROR_PATH must point to a deployed recoverable error fallback route.');

    await page.goto(errorPath);

    const alert = await errorAlert(page);
    const control = await resetControl(page);

    await control.click();

    await expect(page).toHaveURL(new RegExp(errorPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(alert).toBeHidden();
  });

  test('keyboard user skips directly to main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: /skip to main content/i }).first();

    await page.keyboard.press('Tab');

    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();
  });

  test('keyboard user activates the skip link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: /skip to main content/i }).first();

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    const href = await skipLink.getAttribute('href');
    expect(href, 'skip link should target an in-page main landmark').toMatch(/^#/);

    const targetId = href?.slice(1) ?? '';
    expect(targetId, 'skip link target should use a stable id').toMatch(/^[A-Za-z][\w-]*$/);

    const mainTarget = page.locator(`main#${targetId}, [role="main"]#${targetId}`).first();

    await expect(mainTarget).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
    await expectFocusInside(page, mainTarget);
  });
});
