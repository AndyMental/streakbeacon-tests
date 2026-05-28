import { expect, test, type Page } from '@playwright/test';
import {
  loginSeededUser,
  missingRequiredEnv,
  openSettingsPanel
} from './helpers';

// Maps 1:1 to streakbeacon-tests/features/home-responsive-state-regressions.feature.
// Two gates apply before these run live:
//   1. Env gate (skip): STREAKBEACON_BASE_URL + seeded credentials must be supplied,
//      AND seeded accounts that can be placed into empty / loading / error / 3-digit
//      states must exist on the deployed Vercel site.
//   2. Product gate (fixme): AND-5183 product fix is parked behind AND-4746;
//      lift the test.fixme() once empty/loading/error states and clip-safe Data
//      stats ship on the deployed Vercel URL.

const missingEnv = missingRequiredEnv();
const PRODUCT_FIX_PENDING =
  'AND-5183 home/responsive fix parked behind AND-4746 — lift test.fixme() when deployed.';

async function viewportLabel(width: number): Promise<string> {
  return `${width}px viewport`;
}

async function setNarrowViewport(page: Page, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 720 });
}

test.describe('Home empty / loading / error states (AND-5183)', () => {
  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);
  test.fixme(true, PRODUCT_FIX_PENDING);

  test('home shows an empty state when no habits exist', async ({ page }) => {
    // Seeded account in this run must have zero tracked habits.
    await loginSeededUser(page);

    const todayCard = page.getByRole('region', { name: /today/i });
    await expect(todayCard).toBeVisible();
    await expect(todayCard).toContainText(/add a habit|no habits|get started/i);

    await expect(todayCard).not.toContainText(/demo|placeholder/i);
  });

  test('home shows a loading skeleton before user data is ready', async ({ page }) => {
    await loginSeededUser(page);

    const skeleton = page.locator('[data-testid*="skeleton" i], [aria-busy="true"]').first();
    await expect(skeleton).toBeVisible();

    await expect(skeleton).toBeHidden({ timeout: 15_000 });

    const todayCard = page.getByRole('region', { name: /today/i });
    await expect(todayCard).toBeVisible();
  });

  test('home shows a destructive error when streak data fails to load', async ({ page }) => {
    // Seeded account in this run must be in an unreadable-streak-data state.
    await loginSeededUser(page);

    const errorAlert = page.getByRole('alert').filter({ hasText: /unable|could not|failed/i });
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/streak|data|read/i);
  });
});

test.describe('Settings Data stats do not clip on narrow viewports (AND-5183)', () => {
  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);
  test.fixme(true, PRODUCT_FIX_PENDING);

  for (const width of [320, 360, 414] as const) {
    test(`Data stats at ${width}px show full numeric values without clipping`, async ({ page }) => {
      await setNarrowViewport(page, width);
      await loginSeededUser(page);
      await openSettingsPanel(page);

      const dataCard = page.getByRole('region', { name: /data/i });
      const stats = dataCard.getByRole('term').or(dataCard.locator('dt')).all();

      for (const term of await stats) {
        const definition = term.locator('xpath=following-sibling::dd[1]');
        await expect(definition, await viewportLabel(width)).toBeVisible();

        const overflow = await definition.evaluate((node) => {
          const element = node as HTMLElement;
          return {
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          };
        });

        expect(
          overflow.scrollWidth,
          `Data stat clipped at ${width}px: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`
        ).toBeLessThanOrEqual(overflow.clientWidth);

        const labelOverflow = await term.evaluate((node) => {
          const element = node as HTMLElement;
          return {
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          };
        });

        expect(
          labelOverflow.scrollWidth,
          `Data stat label clipped at ${width}px`
        ).toBeLessThanOrEqual(labelOverflow.clientWidth);
      }
    });
  }
});

test.describe('Today badge readability on small screens (AND-5183)', () => {
  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);
  test.fixme(true, PRODUCT_FIX_PENDING);

  for (const width of [320, 360, 414, 768] as const) {
    test(`Today badges remain fully visible at ${width}px`, async ({ page }) => {
      await setNarrowViewport(page, width);
      // Seeded account in this run must have at least one habit with a status badge today.
      await loginSeededUser(page);

      const todayCard = page.getByRole('region', { name: /today/i });
      const badges = todayCard.locator('[data-slot="badge"], [class*="badge" i]');
      const count = await badges.count();
      expect(count, `expected at least one Today status badge at ${width}px`).toBeGreaterThan(0);

      for (let index = 0; index < count; index += 1) {
        const badge = badges.nth(index);
        await expect(badge, await viewportLabel(width)).toBeVisible();

        const dimensions = await badge.evaluate((node) => {
          const element = node as HTMLElement;
          return {
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight
          };
        });

        expect(
          dimensions.scrollWidth,
          `Today badge text clipped horizontally at ${width}px`
        ).toBeLessThanOrEqual(dimensions.clientWidth);
        expect(
          dimensions.scrollHeight,
          `Today badge text clipped vertically at ${width}px`
        ).toBeLessThanOrEqual(dimensions.clientHeight);
      }
    });
  }
});
