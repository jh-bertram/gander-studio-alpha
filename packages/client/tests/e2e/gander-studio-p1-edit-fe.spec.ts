import { test, expect } from '@playwright/test';

// Load test — edit page renders the file picker
test('edit page loads with file picker', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: /edit/i }).click();
  const editPage = page.getByTestId('edit-page');
  await expect(editPage).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Select file to edit' });
  await expect(trigger).toBeVisible();
});

// Primary interaction test — file picker popover opens
test('file picker popover opens and shows file list sections', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: /edit/i }).click();
  const trigger = page.getByRole('button', { name: 'Select file to edit' });
  await trigger.click();
  const fileList = page.getByRole('listbox', { name: 'File list' });
  await expect(fileList).toBeVisible();
  const filterInput = page.getByRole('textbox', { name: 'Filter file list' });
  await expect(filterInput).toBeVisible();
});

// Error / empty state test — no file selected shows empty state
test('edit page shows empty state when no file is selected', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: /edit/i }).click();
  await expect(page.getByText('Select a file to edit')).toBeVisible();
  await expect(page.getByText('Choose an agent or skill file from the picker above')).toBeVisible();
  const saveButton = page.getByRole('button', { name: /save changes/i });
  await expect(saveButton).toBeDisabled();
});
