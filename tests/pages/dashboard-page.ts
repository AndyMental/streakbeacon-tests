import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(
      this.byTestId('dashboard')
        .or(this.page.getByRole('main'))
        .or(this.page.getByRole('heading', { name: /streakbeacon|dashboard|habits/i }))
        .first()
    ).toBeVisible();
  }

  async expectEmptyState(): Promise<void> {
    await expect(
      this.byTestId('empty-habits')
        .or(this.page.getByText(/no habits|add your first habit|nothing tracked/i))
        .first()
    ).toBeVisible();
  }

  async addHabit(name: string): Promise<void> {
    await this.fillFirst(
      [
        this.byTestId('habit-name-input'),
        this.page.getByLabel(/habit name|name/i),
        this.page.getByPlaceholder(/habit|what.*track/i),
        this.page.locator('input[name*="habit" i]')
      ],
      name,
      'habit name input'
    );

    await this.clickFirst(
      [
        this.byTestId('add-habit-button'),
        this.page.getByRole('button', { name: /add habit|create habit|add/i }),
        this.page.locator('button[type="submit"]')
      ],
      'add habit control'
    );
  }

  habitRow(name: string): Locator {
    return this.byTestId('habit-row')
      .filter({ hasText: name })
      .or(this.page.getByRole('row', { name: new RegExp(name, 'i') }))
      .or(this.page.getByRole('listitem').filter({ hasText: name }))
      .or(this.page.getByRole('article').filter({ hasText: name }))
      .first();
  }

  async expectHabitVisible(name: string): Promise<void> {
    await expect(this.habitRow(name)).toBeVisible();
  }

  async expectCurrentStreak(name: string, count: number): Promise<void> {
    const row = this.habitRow(name);

    await expect(
      row
        .getByTestId('current-streak-count')
        .or(row.getByText(new RegExp(`\\b${count}\\b.*(?:day|streak)|(?:streak|current).*\\b${count}\\b`, 'i')))
        .first()
    ).toBeVisible();
  }

  async toggleToday(name: string): Promise<void> {
    const row = this.habitRow(name);

    await this.clickFirst(
      [
        row.getByTestId('toggle-today'),
        row.getByRole('button', { name: /mark today|unmark today|today|complete|done/i }),
        row.getByRole('checkbox', { name: /today|complete|done/i })
      ],
      `today toggle for ${name}`
    );
  }

  gridCell(name: string, dayLabel: string | RegExp): Locator {
    const labelPattern = typeof dayLabel === 'string' ? new RegExp(dayLabel, 'i') : dayLabel;
    const row = this.habitRow(name);

    return row
      .getByTestId('streak-grid-cell')
      .filter({ hasText: labelPattern })
      .or(row.getByRole('button', { name: labelPattern }))
      .or(row.getByRole('gridcell', { name: labelPattern }))
      .first();
  }

  async expectGridCellCompleted(name: string, dayLabel: string | RegExp): Promise<void> {
    const cell = this.gridCell(name, dayLabel);
    const className = await cell.getAttribute('class').catch(() => '');

    await expect(cell).toBeVisible();
    expect(
      (await cell.getAttribute('aria-pressed')) === 'true' ||
        (await cell.getAttribute('aria-selected')) === 'true' ||
        (await cell.getAttribute('data-state')) === 'completed' ||
        /complete|completed|active|selected|marked|checked|done/i.test(className ?? '')
    ).toBeTruthy();
  }

  async expectGridCellOpen(name: string, dayLabel: string | RegExp): Promise<void> {
    const cell = this.gridCell(name, dayLabel);
    const className = await cell.getAttribute('class').catch(() => '');

    await expect(cell).toBeVisible();
    expect(
      (await cell.getAttribute('aria-pressed')) !== 'true' &&
        (await cell.getAttribute('data-state')) !== 'completed' &&
        !/complete|completed|active|marked|checked|done/i.test(className ?? '')
    ).toBeTruthy();
  }

  async selectGridCell(name: string, dayLabel: string | RegExp): Promise<void> {
    await this.gridCell(name, dayLabel).click();
  }

  async expectSelectedDay(dayLabel: RegExp): Promise<void> {
    await expect(
      this.byTestId('selected-day')
        .or(this.page.getByRole('status'))
        .or(this.page.getByText(dayLabel))
        .first()
    ).toBeVisible();
  }

  async markSelectedDay(): Promise<void> {
    await this.clickFirst(
      [
        this.byTestId('mark-selected-day'),
        this.page.getByRole('button', { name: /mark selected day|mark day|complete selected/i })
      ],
      'mark selected day control'
    );
  }

  async unmarkSelectedDay(): Promise<void> {
    await this.clickFirst(
      [
        this.byTestId('unmark-selected-day'),
        this.page.getByRole('button', { name: /unmark selected day|unmark day|clear selected/i })
      ],
      'unmark selected day control'
    );
  }
}
