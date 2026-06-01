import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredBaseEnv = ['STREAKBEACON_BASE_URL'] as const;
const optionalCredentialEnv = ['STREAKBEACON_TEST_EMAIL', 'STREAKBEACON_TEST_PASSWORD'] as const;
type Theme = 'light' | 'dark';

/*
 * Snapshot names are explicit so updates are reviewable:
 * STREAKBEACON_BASE_URL=<deployed-vercel-url> \
 * STREAKBEACON_TEST_EMAIL=<seeded-email> \
 * STREAKBEACON_TEST_PASSWORD=<seeded-password> \
 * npx playwright test tests/visual/grid-settings.spec.ts --update-snapshots
 */

function env(name: (typeof requiredBaseEnv)[number] | (typeof optionalCredentialEnv)[number]): string | undefined {
  return process.env[name];
}

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

async function clickFirstVisible(candidates: Locator[]): Promise<boolean> {
  for (const candidate of candidates) {
    const control = await firstVisible(candidate);

    if (control) {
      await control.click();
      return true;
    }
  }

  return false;
}

async function fillFirstVisible(candidates: Locator[], value: string): Promise<boolean> {
  for (const candidate of candidates) {
    const field = await firstVisible(candidate);

    if (field) {
      await field.fill(value);
      return true;
    }
  }

  return false;
}

async function loginIfPrompted(page: Page): Promise<'signed-in' | 'not-required' | 'missing-credentials'> {
  await page.goto('/');

  const signInControl = await firstVisible(
    page
      .getByRole('link', { name: /log in|login|sign in|signin/i })
      .or(page.getByRole('button', { name: /log in|login|sign in|signin/i }))
  );

  if (signInControl) {
    await signInControl.click();
  }

  const emailField = await firstVisible(
    page
      .getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'))
      .or(page.locator('input[name*="email" i]'))
  );

  if (!emailField) {
    return 'not-required';
  }

  const email = env('STREAKBEACON_TEST_EMAIL');
  const password = env('STREAKBEACON_TEST_PASSWORD');

  if (!email || !password) {
    return 'missing-credentials';
  }

  await emailField.fill(email);

  const passwordFilled = await fillFirstVisible(
    [page.getByLabel(/password/i), page.getByPlaceholder(/password/i), page.locator('input[type="password"]')],
    password
  );
  expect(passwordFilled).toBeTruthy();

  const submitted = await clickFirstVisible([
    page.getByRole('button', { name: /log in|login|sign in|signin|continue/i }),
    page.locator('button[type="submit"]')
  ]);
  expect(submitted).toBeTruthy();

  await expect(page.getByRole('button', { name: /log out|logout|sign out|signout/i })).toBeVisible();
  return 'signed-in';
}

async function openDashboard(page: Page): Promise<void> {
  const navigated = await clickFirstVisible([
    page.getByRole('link', { name: /dashboard|home|habits|streaks/i }),
    page.getByRole('button', { name: /dashboard|home|habits|streaks/i })
  ]);

  if (!navigated) {
    await page.goto('/');
  }

  await expect(page.locator('body')).toContainText(/streak|habit|today/i);
}

async function openSettings(page: Page): Promise<void> {
  const navigated = await clickFirstVisible([
    page.getByRole('link', { name: /settings|preferences/i }),
    page.getByRole('button', { name: /settings|preferences/i })
  ]);

  if (!navigated) {
    await page.goto('/settings');
  }

  await expect(page.locator('body')).toContainText(/settings|theme|appearance|export|import|reset/i);
}

async function chooseTheme(page: Page, theme: Theme): Promise<void> {
  await openSettings(page);

  const themePattern = new RegExp(`${theme}\\s+theme|theme\\s+${theme}|^\\s*${theme}\\s*$`, 'i');
  const selected = await clickFirstVisible([
    page.getByRole('radio', { name: themePattern }),
    page.getByRole('button', { name: themePattern }),
    page.getByRole('menuitemradio', { name: themePattern }),
    page.getByLabel(themePattern),
    page.getByText(themePattern)
  ]);

  expect(selected, `Expected a visible ${theme} theme control on the settings surface`).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
}

async function freezeVisualNoise(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
}

test.describe('StreakBeacon visual regression baselines', () => {
  const missingBaseEnv = requiredBaseEnv.filter((name) => !env(name));

  test.skip(missingBaseEnv.length > 0, `Missing required black-box test input: ${missingBaseEnv.join(', ')}`);

  test.beforeEach(async ({ page }) => {
    const loginState = await loginIfPrompted(page);
    test.skip(
      loginState === 'missing-credentials',
      `Login prompt requires seeded credentials: ${optionalCredentialEnv.join(', ')}`
    );
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`streak grid matches the ${theme} mode visual baseline`, async ({ page }) => {
      await chooseTheme(page, theme);
      await openDashboard(page);
      await freezeVisualNoise(page);

      await expect(page).toHaveScreenshot(`streak-grid-${theme}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test(`settings surface matches the ${theme} mode visual baseline`, async ({ page }) => {
      await chooseTheme(page, theme);
      await openSettings(page);
      await freezeVisualNoise(page);

      await expect(page).toHaveScreenshot(`settings-${theme}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  }
});
