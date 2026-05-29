import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL', 'STREAKBEACON_TEST_EMAIL', 'STREAKBEACON_TEST_PASSWORD'] as const;

function requireEnv(name: (typeof requiredEnv)[number]): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set to run black-box StreakBeacon smoke tests.`);
  }

  return value;
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

async function fillFirstAvailable(candidates: Locator[], value: string): Promise<void> {
  for (const candidate of candidates) {
    const field = await firstVisible(candidate);

    if (field) {
      await field.fill(value);
      return;
    }
  }

  throw new Error(`Could not find a visible input for ${value.includes('@') ? 'email' : 'password'}.`);
}

async function clickFirstAvailable(candidates: Locator[]): Promise<void> {
  for (const candidate of candidates) {
    const control = await firstVisible(candidate);

    if (control) {
      await control.click();
      return;
    }
  }

  throw new Error('Could not find a visible control to continue the flow.');
}

async function login(page: Page): Promise<void> {
  await page.goto('/');

  const signInLink = await firstVisible(
    page
      .getByRole('link', { name: /log in|login|sign in|signin/i })
      .or(page.getByRole('button', { name: /log in|login|sign in|signin/i }))
  );

  if (signInLink) {
    await signInLink.click();
  }

  await fillFirstAvailable(
    [
      page.getByLabel(/email/i),
      page.getByPlaceholder(/email/i),
      page.locator('input[type="email"]'),
      page.locator('input[name*="email" i]')
    ],
    requireEnv('STREAKBEACON_TEST_EMAIL')
  );

  await fillFirstAvailable(
    [
      page.getByLabel(/password/i),
      page.getByPlaceholder(/password/i),
      page.locator('input[type="password"]'),
      page.locator('input[name*="password" i]')
    ],
    requireEnv('STREAKBEACON_TEST_PASSWORD')
  );

  await clickFirstAvailable([
    page.getByRole('button', { name: /log in|login|sign in|signin|continue/i }),
    page.locator('button[type="submit"]')
  ]);

  await expect(page.getByRole('button', { name: /log out|logout|sign out|signout/i })).toBeVisible();
}

function preferredTheme(before: string): 'dark' | 'light' {
  return /\bdark\b/i.test(before) ? 'light' : 'dark';
}

function themeOptionCandidates(page: Page, theme: 'dark' | 'light'): Locator[] {
  const themePattern = new RegExp(`${theme}\\s+theme|theme\\s+${theme}|^\\s*${theme}\\s*$`, 'i');

  return [
    page.locator(`[data-testid="theme-toggle-${theme}"]`),
    page.locator('[data-testid="theme-toggle"]').getByRole('radio', { name: themePattern }),
    page.locator('[data-testid="theme-toggle"]').getByRole('button', { name: themePattern }),
    page.locator('[data-testid="theme-toggle"]').getByRole('menuitemradio', { name: themePattern }),
    page.getByRole('radio', { name: themePattern }),
    page.getByRole('button', { name: themePattern }),
    page.getByRole('menuitemradio', { name: themePattern }),
    page.getByLabel(themePattern)
  ];
}

async function findThemeOption(page: Page, before: string): Promise<Locator> {
  for (const theme of [preferredTheme(before), preferredTheme(before) === 'dark' ? 'light' : 'dark']) {
    for (const candidate of themeOptionCandidates(page, theme)) {
      const control = await firstVisible(candidate);

      if (control) {
        return control;
      }
    }
  }

  const settingsEntry = await firstVisible(
    page.getByRole('link', { name: /settings/i }).or(page.getByRole('button', { name: /settings/i }))
  );

  if (settingsEntry) {
    await settingsEntry.click();

    for (const theme of [preferredTheme(before), preferredTheme(before) === 'dark' ? 'light' : 'dark']) {
      for (const candidate of themeOptionCandidates(page, theme)) {
        const control = await firstVisible(candidate);

        if (control) {
          return control;
        }
      }
    }
  }

  throw new Error(
    'Theme option not found on the dashboard or settings surface. AND-5562 must expose an actionable dark/light child control, such as [data-testid="theme-toggle-dark"] or a radio/button/menuitemradio with an accessible dark/light theme name.'
  );
}

async function readThemeSignal(page: Page): Promise<string> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const cls = root.className || '';
    const dataTheme = root.getAttribute('data-theme') || '';

    return `${cls}|${dataTheme}`;
  });
}

test.describe('StreakBeacon theme toggle smoke', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test('signed-in user can toggle the dashboard theme', async ({ page }) => {
    await login(page);

    const before = await readThemeSignal(page);
    const toggle = await findThemeOption(page, before);

    await toggle.click();

    await expect.poll(async () => readThemeSignal(page), { timeout: 5_000 }).not.toBe(before);
  });

  test('theme choice persists across reload', async ({ page }) => {
    await login(page);

    const before = await readThemeSignal(page);
    const toggle = await findThemeOption(page, before);

    await toggle.click();

    await expect.poll(async () => readThemeSignal(page), { timeout: 5_000 }).not.toBe(before);

    const afterToggle = await readThemeSignal(page);

    await page.reload();

    expect(await readThemeSignal(page)).toBe(afterToggle);
  });
});
