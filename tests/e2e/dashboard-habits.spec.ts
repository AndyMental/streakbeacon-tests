import { expect, test } from '../fixtures/deploy-gate';
import { DashboardPage } from '../pages/dashboard-page';

test.skip(!process.env.STREAKBEACON_BASE_URL, 'STREAKBEACON_BASE_URL is required for black-box automation.');

test.describe('create-habit.feature', () => {
  test('first-run dashboard shows an empty state', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();

    await dashboard.expectLoaded();
    await dashboard.expectEmptyState();
    await expect(page.getByRole('button', { name: /add habit|create habit|add/i })).toBeVisible();
  });

  test('user adds a first habit and sees a zero streak', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const habitName = `Read ${Date.now()}`;

    await dashboard.goto();
    await dashboard.addHabit(habitName);

    await dashboard.expectHabitVisible(habitName);
    await dashboard.expectCurrentStreak(habitName, 0);
  });
});

test.describe('today-streak-completion.feature', () => {
  test('user marks today complete and then unmarks it', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const habitName = `Read ${Date.now()}`;

    await dashboard.goto();
    await dashboard.addHabit(habitName);
    await dashboard.toggleToday(habitName);

    await dashboard.expectGridCellCompleted(habitName, /today/i);
    await dashboard.expectCurrentStreak(habitName, 1);

    await dashboard.toggleToday(habitName);

    await dashboard.expectGridCellOpen(habitName, /today/i);
    await dashboard.expectCurrentStreak(habitName, 0);
  });
});

test.describe('local-persistence.feature', () => {
  test('user sees saved habits and completed today after reload', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const habitName = `Read ${Date.now()}`;

    await dashboard.goto();
    await dashboard.addHabit(habitName);
    await dashboard.toggleToday(habitName);
    await page.reload();

    await dashboard.expectHabitVisible(habitName);
    await dashboard.expectGridCellCompleted(habitName, /today/i);
  });
});
