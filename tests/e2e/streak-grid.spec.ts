import { test } from '../fixtures/deploy-gate';
import { DashboardPage } from '../pages/dashboard-page';

test.skip(!process.env.STREAKBEACON_BASE_URL, 'STREAKBEACON_BASE_URL is required for black-box automation.');

test.describe('streak-grid-interactions.feature', () => {
  test('user selects a previous day and marks it complete from the grid', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const habitName = `Read ${Date.now()}`;

    await dashboard.goto();
    await dashboard.addHabit(habitName);
    await dashboard.selectGridCell(habitName, /yesterday|previous day/i);

    await dashboard.expectSelectedDay(/yesterday|previous day/i);

    await dashboard.markSelectedDay();

    await dashboard.expectGridCellCompleted(habitName, /yesterday|previous day/i);
  });

  test('user marks a selected completed day open from the grid', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const habitName = `Read ${Date.now()}`;

    await dashboard.goto();
    await dashboard.addHabit(habitName);
    await dashboard.selectGridCell(habitName, /yesterday|previous day/i);
    await dashboard.markSelectedDay();
    await dashboard.unmarkSelectedDay();

    await dashboard.expectGridCellOpen(habitName, /yesterday|previous day/i);
  });
});
