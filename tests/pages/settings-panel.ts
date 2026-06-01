import { expect, type Locator, type Page } from '@playwright/test';

export const settingsPanelTestIds = {
  trigger: 'settings-panel-trigger',
  panel: 'settings-panel',
  resetDataButton: 'settings-reset-data-button',
  resetDialog: 'settings-reset-data-dialog',
  resetCancelButton: 'settings-reset-data-cancel',
  resetConfirmButton: 'settings-reset-data-confirm',
  resetStatus: 'settings-reset-data-status'
} as const;

export class SettingsPanel {
  readonly page: Page;
  readonly trigger: Locator;
  readonly panel: Locator;
  readonly resetDataButton: Locator;
  readonly resetDialog: Locator;
  readonly resetCancelButton: Locator;
  readonly resetConfirmButton: Locator;
  readonly resetStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.trigger = page.getByTestId(settingsPanelTestIds.trigger);
    this.panel = page.getByTestId(settingsPanelTestIds.panel);
    this.resetDataButton = page.getByTestId(settingsPanelTestIds.resetDataButton);
    this.resetDialog = page.getByTestId(settingsPanelTestIds.resetDialog);
    this.resetCancelButton = page.getByTestId(settingsPanelTestIds.resetCancelButton);
    this.resetConfirmButton = page.getByTestId(settingsPanelTestIds.resetConfirmButton);
    this.resetStatus = page.getByTestId(settingsPanelTestIds.resetStatus);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async open(): Promise<void> {
    await this.trigger.click();
    await expect(this.panel).toBeVisible();
  }

  async requestResetData(): Promise<void> {
    await this.resetDataButton.click();
    await expect(this.resetDialog).toBeVisible();
  }

  async cancelResetData(): Promise<void> {
    await this.resetCancelButton.click();
    await expect(this.resetDialog).toBeHidden();
  }

  async confirmResetData(): Promise<void> {
    await this.resetConfirmButton.click();
    await expect(this.resetDialog).toBeHidden();
  }

  async expectResetSucceeded(): Promise<void> {
    await expect(this.resetStatus).toBeVisible();
    await expect(this.resetStatus).toContainText(/reset|cleared|removed|success/i);
  }
}
