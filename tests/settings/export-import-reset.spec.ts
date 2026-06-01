import { expect, type Download, type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

function missingEnv(): string[] {
  return requiredEnv.filter((name) => !process.env[name]);
}

function uniqueHabit(prefix: string): string {
  return `${prefix} ${Date.now()}`;
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

  await expect(page.getByText(habitName, { exact: false })).toBeVisible();
}

async function openSettings(page: Page): Promise<void> {
  await openDashboard(page);

  const settingsControl = await firstVisible(
    page
      .getByRole('link', { name: /settings|preferences/i })
      .or(page.getByRole('button', { name: /settings|preferences/i }))
      .or(page.getByLabel(/settings|preferences/i))
  );

  if (settingsControl) {
    await settingsControl.click();
  } else {
    await page.goto('/settings');
  }

  await expect(page.getByText(/settings|appearance|export|import|reset/i).first()).toBeVisible();
}

async function clickExport(page: Page): Promise<Download | null> {
  const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null);

  await clickFirstAvailable(
    [
      page.getByRole('button', { name: /export.*json|download.*json|export|download/i }),
      page.getByRole('link', { name: /export.*json|download.*json|export|download/i })
    ],
    'export control'
  );

  return downloadPromise;
}

async function readExportedSettings(page: Page): Promise<unknown> {
  const download = await clickExport(page);

  if (download) {
    const path = await download.path();

    if (!path) {
      throw new Error('Export download did not expose a local path for JSON validation.');
    }

    return JSON.parse(await readFile(path, 'utf8'));
  }

  const exposedJson = await firstVisible(
    page.locator('textarea, pre, code, [role="textbox"]').filter({ hasText: /[{[]/ })
  );

  if (!exposedJson) {
    throw new Error('Export did not download a file or expose JSON settings data in the page.');
  }

  return JSON.parse((await exposedJson.textContent()) ?? '');
}

async function writeImportFile(testInfo: TestInfo, filename: string, content: string): Promise<string> {
  const filePath = testInfo.outputPath(filename);
  await writeFile(filePath, content);
  return filePath;
}

async function uploadImportFile(page: Page, filePath: string): Promise<void> {
  const fileInput = page.locator('input[type="file"]').first();

  if ((await fileInput.count()) > 0) {
    await fileInput.setInputFiles(filePath);
    return;
  }

  const fileChooserPromise = page.waitForEvent('filechooser');
  await clickFirstAvailable(
    [page.getByRole('button', { name: /import|restore|choose.*file|select.*file|upload/i })],
    'import file control'
  );
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
}

async function confirmImport(page: Page): Promise<void> {
  await clickFirstAvailable(
    [page.getByRole('button', { name: /confirm.*import|import.*data|restore.*data|confirm|import|restore/i })],
    'confirm import control'
  );
}

async function triggerReset(page: Page, action: 'accept' | 'dismiss'): Promise<void> {
  const dialogPromise = page.waitForEvent('dialog', { timeout: 1_000 }).catch(() => null);

  await clickFirstAvailable(
    [page.getByRole('button', { name: /reset.*data|clear.*data|delete.*data|reset/i })],
    'reset data control'
  );

  const dialog = await dialogPromise;

  if (dialog) {
    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
    return;
  }

  if (action === 'accept') {
    await clickFirstAvailable(
      [page.getByRole('button', { name: /confirm.*reset|reset.*all|clear.*all|delete.*all|confirm|reset/i })],
      'reset confirmation control'
    );
    return;
  }

  await clickFirstAvailable(
    [page.getByRole('button', { name: /cancel|keep.*data|never mind|close/i })],
    'reset cancel control'
  );
}

test.describe('Settings export, import, and reset', () => {
  const missing = missingEnv();

  test.skip(missing.length > 0, `Missing required black-box test input: ${missing.join(', ')}`);

  test.beforeEach(async ({ page }) => {
    await resetBrowserStorage(page);
  });

  test('exports valid persisted settings data for tracked habits', async ({ page }) => {
    const habitName = uniqueHabit('Exported Habit');
    await createHabit(page, habitName);
    await openSettings(page);

    const exported = await readExportedSettings(page);

    expect(exported).toEqual(expect.any(Object));
    expect(JSON.stringify(exported)).toContain(habitName);
    await expect(page.getByText(/export.*success|download.*ready|backup.*created/i).first()).toBeVisible();
  });

  test('previews and confirms a valid settings import without replacing current data early', async ({
    page
  }, testInfo) => {
    const importedHabit = uniqueHabit('Imported Habit');
    const originalHabit = uniqueHabit('Original Habit');

    await createHabit(page, importedHabit);
    await openSettings(page);
    const exported = await readExportedSettings(page);
    const importPath = await writeImportFile(testInfo, 'valid-streakbeacon-backup.json', JSON.stringify(exported));

    await resetBrowserStorage(page);
    await createHabit(page, originalHabit);
    await openSettings(page);
    await uploadImportFile(page, importPath);

    await expect(page.getByText(/preview|ready to import|confirm import|review/i).first()).toBeVisible();
    await expect(page.getByText(originalHabit, { exact: false })).toBeVisible();

    await confirmImport(page);

    await expect(page.getByText(/import.*success|restore.*success|imported|restored/i).first()).toBeVisible();
    await openDashboard(page);
    await expect(page.getByText(importedHabit, { exact: false })).toBeVisible();
  });

  test('rejects an invalid settings import and preserves current data', async ({ page }, testInfo) => {
    const habitName = uniqueHabit('Preserved Habit');
    const invalidPath = await writeImportFile(testInfo, 'invalid-streakbeacon-backup.json', '{"not valid"');

    await createHabit(page, habitName);
    await openSettings(page);
    await uploadImportFile(page, invalidPath);

    await expect(page.getByText(/invalid|error|could not import|failed|unsupported/i).first()).toBeVisible();
    await openDashboard(page);
    await expect(page.getByText(habitName, { exact: false })).toBeVisible();
  });

  test('cancels and confirms reset all local data', async ({ page }) => {
    const canceledHabit = uniqueHabit('Canceled Reset Habit');
    const confirmedHabit = uniqueHabit('Confirmed Reset Habit');

    await createHabit(page, canceledHabit);
    await openSettings(page);
    await triggerReset(page, 'dismiss');
    await openDashboard(page);
    await expect(page.getByText(canceledHabit, { exact: false })).toBeVisible();

    await createHabit(page, confirmedHabit);
    await openSettings(page);
    await triggerReset(page, 'accept');

    await expect(page.getByText(/reset.*success|data.*cleared|all data.*reset/i).first()).toBeVisible();
    await openDashboard(page);
    await expect(page.getByText(canceledHabit, { exact: false })).toHaveCount(0);
    await expect(page.getByText(confirmedHabit, { exact: false })).toHaveCount(0);
  });
});
