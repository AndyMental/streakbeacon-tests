import { expect, type Locator, type Page, test } from '@playwright/test';

const baseUrlEnv = 'STREAKBEACON_BASE_URL';
const delayedPathEnv = 'STREAKBEACON_RESILIENCE_DELAYED_PATH';
const errorPathEnv = 'STREAKBEACON_RESILIENCE_ERROR_PATH';

function missingEnv(names: string[]): string[] {
  return names.filter((name) => !process.env[name]);
}

function envPath(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set before this test can navigate to the resilience fixture.`);
  }

  return value;
}

function resetControl(page: Page): Locator {
  return page
    .getByRole('button', { name: /try again|retry|reset|reload/i })
    .or(page.getByRole('link', { name: /try again|retry|reset|reload/i }));
}

async function activeElementDescription(page: Page): Promise<string> {
  return page.evaluate(() => {
    const active = document.activeElement;

    if (!active) {
      return '';
    }

    return [active.tagName, active.getAttribute('role'), active.getAttribute('aria-label'), active.textContent]
      .filter(Boolean)
      .join(' ');
  });
}

test.describe('App shell resilience', () => {
  test.describe('loading affordance', () => {
    const missingLoadingInputs = missingEnv([baseUrlEnv, delayedPathEnv]);

    test.skip(
      missingLoadingInputs.length > 0,
      `Missing required black-box loading input: ${missingLoadingInputs.join(', ')}`
    );

    test('user sees loading status while app content is pending', async ({ page }) => {
      await page.goto(envPath(delayedPathEnv));

      const loadingStatus = page.getByRole('status', { name: /loading|streakbeacon/i });
      await expect(loadingStatus).toBeVisible();

      await page.keyboard.press('Tab');

      await expect
        .poll(() => activeElementDescription(page), {
          message: 'loading status should not receive or trap keyboard focus'
        })
        .not.toMatch(/status|loading/i);
    });
  });

  test.describe('error fallback recovery', () => {
    const missingErrorInputs = missingEnv([baseUrlEnv, errorPathEnv]);

    test.skip(
      missingErrorInputs.length > 0,
      `Missing required black-box error fallback input: ${missingErrorInputs.join(', ')}`
    );

    test('user can recover from an error fallback', async ({ page }) => {
      await page.goto(envPath(errorPathEnv));

      await expect(page.getByRole('alert', { name: /streakbeacon|error|problem|went wrong/i })).toBeVisible();
      await expect(resetControl(page)).toBeVisible();
    });

    test('user retries after an error fallback', async ({ page }) => {
      await page.goto(envPath(errorPathEnv));

      const errorAlert = page.getByRole('alert', { name: /streakbeacon|error|problem|went wrong/i });
      await expect(errorAlert).toBeVisible();

      await resetControl(page).click();
      await page.waitForLoadState('domcontentloaded');

      await expect(errorAlert).toBeHidden();
    });
  });

  test.describe('skip link', () => {
    test.skip(!process.env[baseUrlEnv], `Missing required black-box app input: ${baseUrlEnv}`);

    test('keyboard user skips directly to main content', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');

      await expect(page.getByRole('link', { name: /skip to main content/i })).toBeFocused();
    });

    test('keyboard user activates the skip link', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');

      const skipLink = page.getByRole('link', { name: /skip to main content/i });
      await expect(skipLink).toBeFocused();

      const target = await skipLink.getAttribute('href');
      await skipLink.press('Enter');

      await expect(page.getByRole('main')).toBeFocused();
      expect(target).toMatch(/^#/);
      expect(new URL(page.url()).hash).toBe(target);
    });
  });
});
