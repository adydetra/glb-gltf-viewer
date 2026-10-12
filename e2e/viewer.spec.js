import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('GLB/GLTF Viewer E2E Tests', () => {
  test('loads viewer application and shows upload placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('GLB/GLTF Viewer');
    await expect(page.locator('.placeholder')).toBeVisible();
    await expect(page.locator('.placeholder p')).toHaveText('Drop .glb / folder GLTF / .zip here');
  });

  test('uploads .glb file, renders 3D canvas, and controls panel operates cleanly', async ({ page }) => {
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label[for="glb-upload"]').click();
    const fileChooser = await fileChooserPromise;

    const fixturePath = path.resolve('e2e/fixtures/pc.glb');
    await fileChooser.setFiles(fixturePath);

    await expect(page.locator('.file-badge')).toHaveText('pc.glb', { timeout: 10000 });
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.reset-btn')).toBeVisible();

    await page.locator('.controls-toggle').click();
    await expect(page.locator('.config-panel')).toBeVisible();
    await expect(page.locator('.config-panel h3')).toHaveText('Configuration');

    await page.getByRole('button', { name: 'Close configuration' }).click();
    await expect(page.locator('.config-panel')).not.toBeVisible();

    await page.locator('.reset-btn').click();
    await expect(page.locator('.placeholder')).toBeVisible();
    await expect(page.locator('canvas')).not.toBeVisible();
  });

  test('captures screenshot and triggers save download', async ({ page }) => {
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label[for="glb-upload"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve('e2e/fixtures/pc.glb'));

    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('.screenshot-btn').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^glb-screenshot-\d+\.png$/);
    await expect(page.locator('.screenshot-toast')).toBeVisible();
  });
});
