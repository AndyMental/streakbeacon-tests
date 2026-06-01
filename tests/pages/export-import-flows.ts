import { expect, type Download, type Locator, type Page } from '@playwright/test';

export const exportImportTestIds = {
  exportJsonButton: 'settings-export-json-button',
  exportStatus: 'settings-export-status',
  importFileInput: 'settings-import-file-input',
  importPreview: 'settings-import-preview',
  importConfirmButton: 'settings-import-confirm',
  importCancelButton: 'settings-import-cancel',
  importStatus: 'settings-import-status',
  importError: 'settings-import-error'
} as const;

export class ExportImportFlows {
  readonly page: Page;
  readonly exportJsonButton: Locator;
  readonly exportStatus: Locator;
  readonly importFileInput: Locator;
  readonly importPreview: Locator;
  readonly importConfirmButton: Locator;
  readonly importCancelButton: Locator;
  readonly importStatus: Locator;
  readonly importError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exportJsonButton = page.getByTestId(exportImportTestIds.exportJsonButton);
    this.exportStatus = page.getByTestId(exportImportTestIds.exportStatus);
    this.importFileInput = page.getByTestId(exportImportTestIds.importFileInput);
    this.importPreview = page.getByTestId(exportImportTestIds.importPreview);
    this.importConfirmButton = page.getByTestId(exportImportTestIds.importConfirmButton);
    this.importCancelButton = page.getByTestId(exportImportTestIds.importCancelButton);
    this.importStatus = page.getByTestId(exportImportTestIds.importStatus);
    this.importError = page.getByTestId(exportImportTestIds.importError);
  }

  async exportJson(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');

    await this.exportJsonButton.click();

    const download = await downloadPromise;
    await expect(this.exportStatus).toContainText(/export|download|success/i);

    return download;
  }

  async chooseImportFile(filePath: string): Promise<void> {
    await this.importFileInput.setInputFiles(filePath);
  }

  async previewValidImport(filePath: string): Promise<void> {
    await this.chooseImportFile(filePath);
    await expect(this.importPreview).toBeVisible();
  }

  async confirmImport(): Promise<void> {
    await this.importConfirmButton.click();
    await expect(this.importStatus).toContainText(/import|restored|success/i);
  }

  async cancelImport(): Promise<void> {
    await this.importCancelButton.click();
    await expect(this.importPreview).toBeHidden();
  }

  async expectInvalidImportRejected(filePath: string): Promise<void> {
    await this.chooseImportFile(filePath);
    await expect(this.importError).toBeVisible();
    await expect(this.importError).toContainText(/invalid|error|failed/i);
  }
}
