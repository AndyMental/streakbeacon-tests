import { writeFile } from 'node:fs/promises';

import { expect, test } from '../fixtures/deploy-gate';
import { DashboardPage } from '../pages/dashboard-page';
import { SettingsPage } from '../pages/settings-page';

test.skip(!process.env.STREAKBEACON_BASE_URL, 'STREAKBEACON_BASE_URL is required for black-box automation.');

test.describe('settings-panel.feature', () => {
  test('user changes the theme and keeps it after reload', async ({ page }) => {
    const settings = new SettingsPage(page);

    await settings.goto();
    await settings.expectLoaded();
    await settings.selectDarkTheme();
    await page.reload();

    await settings.expectDarkThemeSelected();
  });

  test('user exports tracked data as JSON', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const settings = new SettingsPage(page);

    await dashboard.goto();
    await dashboard.addHabit(`Read ${Date.now()}`);
    await settings.goto();

    const filename = await settings.exportJson();

    expect(filename).toMatch(/streakbeacon|backup|\.json$/i);
    await settings.expectToastOrStatus(/export|download|success/i);
  });

  test('user sees invalid JSON import rejected without replacing current habits', async ({ page }, testInfo) => {
    const dashboard = new DashboardPage(page);
    const settings = new SettingsPage(page);
    const habitName = `Read ${Date.now()}`;
    const invalidJson = testInfo.outputPath('invalid-streakbeacon-backup.json');

    await testInfo.attach('invalid-import-payload', {
      body: 'not valid json',
      contentType: 'application/json'
    });
    await dashboard.goto();
    await dashboard.addHabit(habitName);
    await writeFile(invalidJson, 'not valid json');
    await settings.goto();
    await settings.importJson(invalidJson);

    await settings.expectToastOrStatus(/invalid|error|failed/i);
    await dashboard.goto();
    await dashboard.expectHabitVisible(habitName);
  });
});
