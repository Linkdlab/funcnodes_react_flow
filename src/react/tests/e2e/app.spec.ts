import { test, expect } from '@playwright/test';

test.describe('FuncNodes UI smoke tests', () => {
  test('homepage loads and shows React-Flow canvas', async ({ page }) => {
    await page.goto('/');

    // Wait for the React-Flow canvas root to appear
    const canvas = page.locator('.react-flow__renderer');
    await expect(canvas).toBeVisible();
  });
}); 