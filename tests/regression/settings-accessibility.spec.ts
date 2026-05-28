import { expect, test, type Locator } from '@playwright/test';
import {
  loginSeededUser,
  missingRequiredEnv,
  openSettingsPanel
} from './helpers';

// Maps 1:1 to streakbeacon-tests/features/settings-accessibility-regressions.feature.
// Two gates apply before these run live:
//   1. Env gate (skip): STREAKBEACON_BASE_URL + seeded credentials must be supplied.
//   2. Product gate (fixme): AND-5182 product fix is parked behind AND-4746;
//      lift the test.fixme() once the live regions, reset-armed state, and
//      reduced-motion handling ship on the deployed Vercel URL.

const missingEnv = missingRequiredEnv();
const PRODUCT_FIX_PENDING =
  'AND-5182 settings a11y fix parked behind AND-4746 — lift test.fixme() when deployed.';

async function expectPoliteLiveRegion(scope: Locator, pattern: RegExp): Promise<void> {
  const region = scope.locator('[aria-live="polite"]', { hasText: pattern }).first();
  await expect(region).toBeVisible();
  await expect(region).toHaveAttribute('aria-live', 'polite');
}

async function expectAssertiveLiveRegion(scope: Locator, pattern: RegExp): Promise<void> {
  const region = scope
    .locator('[aria-live="assertive"], [role="alert"]', { hasText: pattern })
    .first();
  await expect(region).toBeVisible();
}

test.describe('Settings panel accessibility regressions (AND-5182)', () => {
  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);
  test.fixme(true, PRODUCT_FIX_PENDING);

  test.beforeEach(async ({ page }) => {
    await loginSeededUser(page);
    await openSettingsPanel(page);
  });

  test('theme change announces a polite status update', async ({ page }) => {
    const themeGroup = page.getByRole('group', { name: /theme preference/i });
    await themeGroup.getByRole('button', { name: /dark theme/i }).click();

    const scope = page.locator('body');
    await expectPoliteLiveRegion(scope, /theme preference saved/i);

    const status = scope.locator('[aria-live="polite"]', { hasText: /theme preference saved/i }).first();
    const moonIcons = status.locator('svg[aria-hidden="true"]');
    await expect(moonIcons).toHaveCount(0);
  });

  test('import preview is announced once and not duplicated', async ({ page }) => {
    const importInput = page.locator('input[type="file"][accept*="json" i]');
    await importInput.setInputFiles({
      name: 'valid-export.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          data: { items: [], completions: {}, preferences: {} }
        })
      )
    });

    const scope = page.locator('body');
    await expectPoliteLiveRegion(scope, /import preview/i);

    const assertiveDuplicates = scope.locator(
      '[role="alert"], [aria-live="assertive"]'
    );
    await expect(
      assertiveDuplicates.filter({ hasText: /import preview/i })
    ).toHaveCount(0);
  });

  test('import error is announced assertively', async ({ page }) => {
    const importInput = page.locator('input[type="file"][accept*="json" i]');
    await importInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ this is not valid json')
    });

    await expectAssertiveLiveRegion(page.locator('body'), /import|invalid|error/i);
  });

  test('unreadable file surfaces an error instead of a silent failure', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const importInput = page.locator('input[type="file"][accept*="json" i]');
    await importInput.setInputFiles({
      name: 'binary.bin',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from([0x00, 0xff, 0xfe, 0x10, 0xab])
    });

    await expectAssertiveLiveRegion(page.locator('body'), /import|read|error|unable/i);

    await expect(
      page.locator('[aria-live="polite"]', { hasText: /import preview/i })
    ).toHaveCount(0);

    expect(pageErrors, 'no uncaught browser error was surfaced').toEqual([]);
  });

  test('reset arming exposes a programmatic state', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /^reset$/i });
    await expect(resetButton).toHaveAttribute('aria-pressed', 'false');

    await resetButton.click();

    const armedButton = page.getByRole('button', { name: /confirm reset|reset/i });
    await expect(armedButton).toHaveAttribute('aria-pressed', 'true');
    await expect(armedButton).toHaveAccessibleName(/confirm reset/i);

    await armedButton.click();
    await expect(
      page.locator('[aria-live="polite"]', { hasText: /local data cleared/i })
    ).toBeVisible();
  });

  test('reduced motion suppresses transitions', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();

    try {
      await loginSeededUser(page);
      await openSettingsPanel(page);

      const themeGroup = page.getByRole('group', { name: /theme preference/i });
      const darkButton = themeGroup.getByRole('button', { name: /dark theme/i });

      const transitionDuration = await darkButton.evaluate((element) => {
        const declared = window.getComputedStyle(element).transitionDuration;
        return declared.split(',').map((value) => value.trim());
      });

      for (const value of transitionDuration) {
        expect(['0s', '0ms']).toContain(value);
      }
    } finally {
      await context.close();
    }
  });
});
