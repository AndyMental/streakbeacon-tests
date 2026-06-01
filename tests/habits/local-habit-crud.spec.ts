import { expect, type Locator, type Page, test } from '@playwright/test';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

function missingEnv(): string[] {
  return requiredEnv.filter((name) => !process.env[name]);
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

async function clickFirstAvailable(candidates: Locator[], description: string): Promise<void> {
  for (const candidate of candidates) {
    const control = await firstVisible(candidate);

    if (control) {
      await control.click();
      return;
    }
  }

  throw new Error(`Could not find a visible ${description}.`);
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

async function openDashboard(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
}

function habitText(page: Page, habitName: string): Locator {
  return page.getByText(habitName, { exact: true });
}

function habitContainer(page: Page, habitName: string): Locator {
  return page
    .getByRole('listitem')
    .filter({ hasText: habitName })
    .or(page.getByRole('row').filter({ hasText: habitName }))
    .or(page.locator('article').filter({ hasText: habitName }))
    .or(page.locator('section').filter({ hasText: habitName }))
    .or(
      habitText(page, habitName).locator('xpath=ancestor::*[self::li or self::tr or self::article or self::section][1]')
    );
}

async function createHabit(page: Page, habitName: string): Promise<void> {
  await openDashboard(page);

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

  await expect(habitText(page, habitName)).toBeVisible();
}

async function deleteHabit(page: Page, habitName: string): Promise<void> {
  const scopedHabit = habitContainer(page, habitName);
  const deleteDialog = page.waitForEvent('dialog', { timeout: 1_000 }).catch(() => null);

  await clickFirstAvailable(
    [
      scopedHabit.getByRole('button', { name: /delete|remove/i }),
      scopedHabit.getByLabel(/delete|remove/i),
      page.getByRole('button', {
        name: new RegExp(`(?:delete|remove).*${habitName}|${habitName}.*(?:delete|remove)`, 'i')
      }),
      page.getByLabel(new RegExp(`(?:delete|remove).*${habitName}|${habitName}.*(?:delete|remove)`, 'i'))
    ],
    `delete habit control for ${habitName}`
  );

  const dialog = await deleteDialog;

  if (dialog) {
    await dialog.accept();
    return;
  }

  const confirmation = await firstVisible(
    page
      .getByRole('button', { name: /confirm.*delete|delete.*habit|remove.*habit|confirm|delete|remove/i })
      .or(page.getByLabel(/confirm.*delete|delete.*habit|remove.*habit|confirm|delete|remove/i))
  );

  if (confirmation) {
    await confirmation.click();
  }
}

test.describe('Local habit CRUD', () => {
  const missing = missingEnv();

  test.skip(missing.length > 0, `Missing required black-box test input: ${missing.join(', ')}`);

  test.beforeEach(async ({ page }) => {
    await resetBrowserStorage(page);
  });

  test('creates a first local habit from an empty dashboard', async ({ page }) => {
    const habitName = 'Read';

    await openDashboard(page);
    await expect(habitText(page, habitName)).toHaveCount(0);

    await createHabit(page, habitName);

    await expect(habitText(page, habitName)).toBeVisible();
    await expect(
      habitContainer(page, habitName)
        .filter({ hasText: /0|zero|streak/i })
        .first()
    ).toBeVisible();
  });

  test('deletes an existing local habit from the dashboard', async ({ page }) => {
    const habitName = 'Read';

    await createHabit(page, habitName);
    await deleteHabit(page, habitName);

    await expect(habitText(page, habitName)).toHaveCount(0);
  });
});
