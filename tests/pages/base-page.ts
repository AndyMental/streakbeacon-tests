import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected async firstVisible(candidates: Locator[], label: string): Promise<Locator> {
    for (const candidate of candidates) {
      const count = await candidate.count();

      for (let index = 0; index < count; index += 1) {
        const item = candidate.nth(index);

        if (await item.isVisible().catch(() => false)) {
          return item;
        }
      }
    }

    throw new Error(`Could not find a visible ${label}.`);
  }

  protected async clickFirst(candidates: Locator[], label: string): Promise<void> {
    const control = await this.firstVisible(candidates, label);

    await control.click();
  }

  protected async fillFirst(candidates: Locator[], value: string, label: string): Promise<void> {
    const field = await this.firstVisible(candidates, label);

    await field.fill(value);
  }

  protected selectedState(locator: Locator): Promise<string | null> {
    return locator.getAttribute('aria-selected');
  }

  async expectToastOrStatus(pattern: RegExp): Promise<void> {
    await expect(
      this.page
        .getByRole('status')
        .or(this.page.getByRole('alert'))
        .or(this.byTestId('toast'))
        .or(this.byTestId('settings-status'))
        .filter({ hasText: pattern })
        .first()
    ).toBeVisible();
  }
}
