import { expect, type Page } from '@playwright/test';

import { BasePage } from './base-page';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');

    if (this.page.url().endsWith('/settings')) {
      return;
    }

    await this.clickFirst(
      [
        this.byTestId('settings-link'),
        this.page.getByRole('link', { name: /settings/i }),
        this.page.getByRole('button', { name: /settings/i })
      ],
      'settings navigation control'
    );
  }

  async expectLoaded(): Promise<void> {
    await expect(
      this.byTestId('settings-panel')
        .or(this.page.getByRole('heading', { name: /settings|preferences/i }))
        .or(this.page.getByRole('main').filter({ hasText: /settings|export|import|theme/i }))
        .first()
    ).toBeVisible();
  }

  async selectDarkTheme(): Promise<void> {
    await this.clickFirst(
      [
        this.byTestId('theme-dark'),
        this.page.getByRole('radio', { name: /dark/i }),
        this.page.getByRole('button', { name: /dark/i }),
        this.page.getByLabel(/dark/i)
      ],
      'dark theme option'
    );
  }

  async expectDarkThemeSelected(): Promise<void> {
    const darkTheme = await this.firstVisible(
      [
        this.byTestId('theme-dark'),
        this.page.getByRole('radio', { name: /dark/i }),
        this.page.getByRole('button', { name: /dark/i }),
        this.page.getByLabel(/dark/i)
      ],
      'dark theme option'
    );

    await expect(darkTheme).toBeVisible();
    expect(
      (await darkTheme.getAttribute('aria-checked')) === 'true' ||
        (await darkTheme.getAttribute('aria-pressed')) === 'true' ||
        (await darkTheme.getAttribute('data-state')) === 'checked' ||
        (await this.selectedState(darkTheme)) === 'true'
    ).toBeTruthy();
  }

  async exportJson(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');

    await this.clickFirst(
      [
        this.byTestId('export-json'),
        this.page.getByRole('button', { name: /export json|download backup|export/i })
      ],
      'export JSON control'
    );

    const download = await downloadPromise;

    return download.suggestedFilename();
  }

  async importJson(filePath: string): Promise<void> {
    const fileInput = this.page
      .locator('input[type="file"]')
      .or(this.byTestId('import-json-input'))
      .first();

    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(filePath);
      return;
    }

    const chooserPromise = this.page.waitForEvent('filechooser');

    await this.clickFirst(
      [
        this.byTestId('import-json'),
        this.page.getByRole('button', { name: /import json|restore backup|choose file|import/i })
      ],
      'import JSON control'
    );

    const chooser = await chooserPromise;

    await chooser.setFiles(filePath);
  }

  async confirmImport(): Promise<void> {
    await this.clickFirst(
      [
        this.byTestId('confirm-import'),
        this.page.getByRole('button', { name: /confirm import|import backup|restore/i })
      ],
      'confirm import control'
    );
  }

  async resetAllData(): Promise<void> {
    await this.clickFirst(
      [
        this.byTestId('reset-all-data'),
        this.page.getByRole('button', { name: /reset all data|delete all data|clear data/i })
      ],
      'reset all data control'
    );

    await this.clickFirst(
      [
        this.byTestId('confirm-reset'),
        this.page.getByRole('button', { name: /confirm reset|reset all|delete all|clear all/i })
      ],
      'confirm reset control'
    );
  }
}
