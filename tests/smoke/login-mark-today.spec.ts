import { expect, type Locator, type Page, test } from '@playwright/test';

const baseUrlEnv = ['STREAKBEACON_BASE_URL', 'DEPLOY_URL', 'BASE_URL'] as const;
const requiredEnv = ['STREAKBEACON_TEST_EMAIL', 'STREAKBEACON_TEST_PASSWORD'] as const;

function requireEnv(name: (typeof requiredEnv)[number]): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set to run black-box StreakBeacon smoke tests.`);
  }

  return value;
}

function todayLabels(): string[] {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(now);
  const monthDay = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(now);

  return [isoDate, 'today', 'Today', weekday, monthDay];
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

async function markToday(page: Page): Promise<Locator> {
  const labels = todayLabels();
  const todayControlCandidates = labels.flatMap((label) => [
    page.getByRole('button', { name: new RegExp(label, 'i') }),
    page.getByRole('checkbox', { name: new RegExp(label, 'i') }),
    page.getByLabel(new RegExp(label, 'i'))
  ]);

  for (const candidate of todayControlCandidates) {
    const control = await firstVisible(candidate);

    if (control) {
      const ariaPressed = await control.getAttribute('aria-pressed');
      const checked = await control.isChecked().catch(() => false);

      if (ariaPressed !== 'true' && !checked) {
        await control.click();
      }

      return control;
    }
  }

  await clickFirstAvailable([
    page.getByRole('button', { name: /mark today|mark complete|complete today|check in|done today/i }),
    page.getByRole('checkbox', { name: /today|complete|done|check in/i })
  ]);

  return page
    .getByRole('button', { name: /today/i })
    .or(page.getByRole('checkbox', { name: /today/i }))
    .first();
}

async function expectTodayMarked(todayControl: Locator): Promise<void> {
  const ariaPressed = await todayControl.getAttribute('aria-pressed').catch(() => null);
  const ariaChecked = await todayControl.getAttribute('aria-checked').catch(() => null);
  const checked = await todayControl.isChecked().catch(() => false);
  const className = await todayControl.getAttribute('class').catch(() => '');

  expect(
    ariaPressed === 'true' ||
      ariaChecked === 'true' ||
      checked ||
      /complete|completed|active|selected|marked|checked|done/i.test(className ?? '')
  ).toBeTruthy();
}

test.describe('StreakBeacon smoke', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);
  const hasBaseUrl = baseUrlEnv.some((name) => process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);
  test.skip(!hasBaseUrl, `Missing required black-box test input: one of ${baseUrlEnv.join(', ')}`);

  test('seeded user can log in, mark today, and see today marked on the streak grid', async ({ page }) => {
    await login(page);

    const todayControl = await markToday(page);

    await expectTodayMarked(todayControl);
  });
});
