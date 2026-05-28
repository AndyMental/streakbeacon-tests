import { expect, type Locator, type Page } from '@playwright/test';

export const requiredEnv = [
  'STREAKBEACON_BASE_URL',
  'STREAKBEACON_TEST_EMAIL',
  'STREAKBEACON_TEST_PASSWORD'
] as const;

export type RequiredEnvName = (typeof requiredEnv)[number];

export function missingRequiredEnv(): RequiredEnvName[] {
  return requiredEnv.filter((name) => !process.env[name]);
}

export function requireEnv(name: RequiredEnvName): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set to run black-box StreakBeacon regression tests.`);
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

async function fillFirstAvailable(candidates: Locator[], value: string, kind: string): Promise<void> {
  for (const candidate of candidates) {
    const field = await firstVisible(candidate);

    if (field) {
      await field.fill(value);
      return;
    }
  }

  throw new Error(`Could not find a visible input for ${kind}.`);
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

export async function loginSeededUser(page: Page): Promise<void> {
  await page.goto('/');

  const signInLink = await firstVisible(
    page.getByRole('link', { name: /log in|login|sign in|signin/i }).or(
      page.getByRole('button', { name: /log in|login|sign in|signin/i })
    )
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
    requireEnv('STREAKBEACON_TEST_EMAIL'),
    'email'
  );

  await fillFirstAvailable(
    [
      page.getByLabel(/password/i),
      page.getByPlaceholder(/password/i),
      page.locator('input[type="password"]'),
      page.locator('input[name*="password" i]')
    ],
    requireEnv('STREAKBEACON_TEST_PASSWORD'),
    'password'
  );

  await clickFirstAvailable([
    page.getByRole('button', { name: /log in|login|sign in|signin|continue/i }),
    page.locator('button[type="submit"]')
  ]);

  await expect(page.getByRole('button', { name: /log out|logout|sign out|signout/i })).toBeVisible();
}

export async function openSettingsPanel(page: Page): Promise<void> {
  const settingsControl = await firstVisible(
    page.getByRole('link', { name: /settings/i }).or(page.getByRole('button', { name: /settings/i }))
  );

  if (settingsControl) {
    await settingsControl.click();
  }

  await expect(page.getByRole('heading', { name: /theme/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /data/i })).toBeVisible();
}
