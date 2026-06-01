import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;
const fixedClockTime = new Date('2026-06-01T12:00:00Z');

function uniqueHabit(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

function todayLabels(now = fixedClockTime): string[] {
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

async function fillFirstAvailable(candidates: Locator[], value: string, description: string): Promise<void> {
  for (const candidate of candidates) {
    const field = await firstVisible(candidate);

    if (field) {
      await field.fill(value);
      return;
    }
  }

  throw new Error(`Could not find a visible ${description}.`);
}

async function clickFirstAvailable(candidates: Locator[], description: string): Promise<Locator> {
  for (const candidate of candidates) {
    const control = await firstVisible(candidate);

    if (control) {
      await control.click();
      return control;
    }
  }

  throw new Error(`Could not find a visible ${description}.`);
}

async function resetBrowserStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();

    if ('databases' in indexedDB) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases
          .map((database) => database.name)
          .filter((name): name is string => Boolean(name))
          .map(
            (name) =>
              new Promise<void>((resolve) => {
                const request = indexedDB.deleteDatabase(name);

                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
                request.onblocked = () => resolve();
              })
          )
      );
    }
  });
  await page.reload();
}

async function createOpenHabit(page: Page, habitName: string): Promise<void> {
  await fillFirstAvailable(
    [
      page.getByLabel(/habit name|new habit|habit/i),
      page.getByPlaceholder(/habit name|new habit|habit/i),
      page.locator('input[name*="habit" i]'),
      page.locator('input[type="text"]').first()
    ],
    habitName,
    'habit name field'
  );

  await clickFirstAvailable(
    [
      page.getByRole('button', { name: /add habit|create habit|save habit|add|create|save/i }),
      page.locator('button[type="submit"]')
    ],
    'add habit control'
  );

  await expect(page.getByText(habitName, { exact: false })).toBeVisible();
}

async function habitSurface(page: Page, habitName: string): Promise<Locator> {
  const habitNamePattern = new RegExp(habitName, 'i');
  const candidates = [
    page.getByRole('row', { name: habitNamePattern }),
    page.getByRole('listitem').filter({ hasText: habitName }),
    page.getByRole('article').filter({ hasText: habitName }),
    page.getByRole('group', { name: habitNamePattern }),
    page.locator('tr, li, article, section, [role="row"], [role="listitem"], [role="group"]').filter({
      hasText: habitName
    })
  ];

  for (const candidate of candidates) {
    const surface = await firstVisible(candidate);

    if (surface) {
      return surface;
    }
  }

  throw new Error(`Could not find a visible habit row or group for "${habitName}".`);
}

async function markToday(page: Page, habitName: string): Promise<Locator> {
  const surface = await habitSurface(page, habitName);
  const labels = todayLabels();
  const todayControlCandidates = labels.flatMap((label) => [
    surface.getByRole('button', { name: new RegExp(label, 'i') }),
    surface.getByRole('checkbox', { name: new RegExp(label, 'i') }),
    surface.getByLabel(new RegExp(label, 'i'))
  ]);

  return clickFirstAvailable(
    [
      ...todayControlCandidates,
      surface.getByRole('button', { name: /mark today|mark complete|complete today|check in|done today/i }),
      surface.getByRole('checkbox', { name: /today|complete|done|check in/i }),
      page.getByRole('button', {
        name: new RegExp(`${habitName}.*(today|mark|complete|done)|(today|mark|complete|done).*${habitName}`, 'i')
      }),
      page.getByRole('checkbox', {
        name: new RegExp(`${habitName}.*(today|mark|complete|done)|(today|mark|complete|done).*${habitName}`, 'i')
      })
    ],
    `Mark today control for "${habitName}"`
  );
}

async function expectTodayMarked(todayControl: Locator, habitName: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const ariaPressed = await todayControl.getAttribute('aria-pressed').catch(() => null);
        const ariaChecked = await todayControl.getAttribute('aria-checked').catch(() => null);
        const checked = await todayControl.isChecked().catch(() => false);
        const className = await todayControl.getAttribute('class').catch(() => '');

        return (
          ariaPressed === 'true' ||
          ariaChecked === 'true' ||
          checked ||
          /complete|completed|active|selected|marked|checked|done/i.test(className ?? '')
        );
      },
      {
        message: `today's grid cell for "${habitName}" should be shown as completed`
      }
    )
    .toBeTruthy();
}

test.describe('StreakBeacon local-first mark today smoke', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(fixedClockTime);
    await resetBrowserStorage(page);
  });

  test('local-first user can create an open habit and mark today complete', async ({ page }) => {
    const habitName = uniqueHabit('Smoke Read');

    expect(todayLabels()).toEqual(['2026-06-01', 'today', 'Today', 'Monday', 'June 1']);

    await createOpenHabit(page, habitName);

    const todayControl = await markToday(page, habitName);

    await expectTodayMarked(todayControl, habitName);
    await expect
      .poll(async () => (await habitSurface(page, habitName)).innerText(), {
        message: `habit row for "${habitName}" should show a current streak count of 1`
      })
      .toMatch(/current streak\D*1|\b1\b\D*current streak|\bstreak\D*1|\b1\b\D*streak/i);
  });
});
