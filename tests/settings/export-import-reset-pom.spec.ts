import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { ExportImportFlows } from '../pages/export-import-flows';
import { SettingsPanel } from '../pages/settings-panel';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;

async function writeJsonFixture(fileName: string, data: unknown): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'streakbeacon-import-'));
  const filePath = join(directory, fileName);

  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

  return filePath;
}

async function writeTextFixture(fileName: string, content: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'streakbeacon-import-'));
  const filePath = join(directory, fileName);

  await writeFile(filePath, content, 'utf8');

  return filePath;
}

function backupFixture(): Record<string, unknown> {
  return {
    version: 1,
    exportedAt: '2026-05-31T00:00:00.000Z',
    habits: [
      {
        id: 'qa-export-import-reset',
        name: 'QA export import reset',
        createdAt: '2026-05-31T00:00:00.000Z',
        completions: ['2026-05-31']
      }
    ]
  };
}

test.describe('settings export, import, and reset POM flows', () => {
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  test.skip(missingEnv.length > 0, `Missing required black-box test input: ${missingEnv.join(', ')}`);

  test('user previews and confirms a valid JSON import', async ({ page }) => {
    const settings = new SettingsPanel(page);
    const transfer = new ExportImportFlows(page);
    const backupPath = await writeJsonFixture('streakbeacon-valid-backup.json', backupFixture());

    await settings.goto();
    await settings.open();
    await transfer.previewValidImport(backupPath);
    await expect(transfer.importPreview).toContainText(/QA export import reset/i);
    await transfer.confirmImport();
    await expect(page.getByText(/QA export import reset/i)).toBeVisible();
  });

  test('user sees invalid JSON import rejected without replacing current data', async ({ page }) => {
    const settings = new SettingsPanel(page);
    const transfer = new ExportImportFlows(page);
    const backupPath = await writeJsonFixture('streakbeacon-valid-backup.json', backupFixture());
    const invalidPath = await writeTextFixture('streakbeacon-invalid-backup.json', '{ this is not valid json');

    await settings.goto();
    await settings.open();
    await transfer.previewValidImport(backupPath);
    await transfer.confirmImport();
    await transfer.expectInvalidImportRejected(invalidPath);
    await expect(page.getByText(/QA export import reset/i)).toBeVisible();
  });

  test('user exports tracked data as a JSON backup file', async ({ page }) => {
    const settings = new SettingsPanel(page);
    const transfer = new ExportImportFlows(page);
    const backupPath = await writeJsonFixture('streakbeacon-valid-backup.json', backupFixture());

    await settings.goto();
    await settings.open();
    await transfer.previewValidImport(backupPath);
    await transfer.confirmImport();

    const download = await transfer.exportJson();

    expect(download.suggestedFilename()).toMatch(/streakbeacon.*\.json$/i);
  });

  test('user cancels reset all local data', async ({ page }) => {
    const settings = new SettingsPanel(page);

    await settings.goto();
    await settings.open();
    await settings.requestResetData();
    await settings.cancelResetData();
    await expect(settings.resetDialog).toBeHidden();
  });

  test('user resets all local data after confirmation', async ({ page }) => {
    const settings = new SettingsPanel(page);
    const transfer = new ExportImportFlows(page);
    const backupPath = await writeJsonFixture('streakbeacon-valid-backup.json', backupFixture());

    await settings.goto();
    await settings.open();
    await transfer.previewValidImport(backupPath);
    await transfer.confirmImport();
    await settings.requestResetData();
    await settings.confirmResetData();
    await settings.expectResetSucceeded();
    await expect(page.getByText(/QA export import reset/i)).toBeHidden();
  });
});
