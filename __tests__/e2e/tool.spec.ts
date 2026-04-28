import { test, expect } from '@playwright/test';

async function closeBackdropIfOpen(page: import('@playwright/test').Page) {
  const backdrop = page.locator('.sidebar-backdrop');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click();
  }
}

test('tool loads with correct title', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toContain('My Tool');
});

test('title input is editable', async ({ page }) => {
  await page.goto('/');
  const titleInput = page.locator('input[type="text"]').first();
  await titleInput.fill('Hello World');
  await expect(titleInput).toHaveValue('Hello World');
});

test('undo/redo buttons enable/disable correctly', async ({ page }) => {
  await page.goto('/');
  await closeBackdropIfOpen(page);
  const titleInput = page.locator('input[type="text"]').first();

  const undoButton = page.getByRole('button', { name: 'Undo (Ctrl+Z)' });
  const redoButton = page.getByRole('button', { name: 'Redo (Ctrl+Y)' });
  await expect(undoButton).toBeDisabled();
  await expect(redoButton).toBeDisabled();

  await titleInput.fill('hello world');

  await expect(undoButton).toBeEnabled();
  await expect(redoButton).toBeDisabled();

  await undoButton.click();
  await expect(redoButton).toBeEnabled();

  await redoButton.click();
  await expect(redoButton).toBeDisabled();
});

test('export dropdown opens and shows JSON format', async ({ page }) => {
  await page.goto('/');
  await closeBackdropIfOpen(page);
  const exportButton = page.getByRole('button', { name: /export/i });
  await exportButton.click();
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('option', { name: /JSON/ })).toBeVisible();
  await page.click('body');
  await expect(menu).not.toBeVisible();
});

test('sidebar toggle button works', async ({ page }) => {
  await page.goto('/');
  await closeBackdropIfOpen(page);
  const sidebarToggle = page.locator('.toolbar-btn-sidebar');
  const sidebar = page.locator('.tool-shell-sidebar');
  const mobile = (await page.viewportSize())?.width !== undefined && (await page.viewportSize())!.width <= 768;
  const isCollapsed = await sidebar.evaluate((el) => el.classList.contains('collapsed'));
  if (isCollapsed) {
    await sidebarToggle.click();
    await expect(sidebar).toHaveClass(/open/);
    if (mobile) {
      await page.locator('.sidebar-backdrop').click();
    } else {
      await sidebarToggle.click();
    }
    await expect(sidebar).toHaveClass(/collapsed/);
    return;
  }
  await expect(sidebar).toHaveClass(/open/);
  if (mobile) {
    await page.locator('.sidebar-backdrop').click();
  } else {
    await sidebarToggle.click();
  }
  await expect(sidebar).toHaveClass(/collapsed/);
});

test('dark mode toggle works', async ({ page }) => {
  await page.goto('/');
  const themeButton = page.getByRole('button', { name: /Switch to dark mode/i });
  if (await themeButton.isVisible()) {
    await themeButton.click();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const lightButton = page.getByRole('button', { name: /Switch to light mode/i });
    await lightButton.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  }
});

test('SEO meta tags are present', async ({ page }) => {
  await page.goto('/');

  const title = await page.title();
  expect(title).toBeTruthy();

  const description = await page.getAttribute('meta[name="description"]', 'content');
  expect(description).toBeTruthy();

  const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
  expect(ogTitle).toBeTruthy();

  const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
  expect(ogImage).toBeTruthy();

  const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
  expect(canonical).toBeTruthy();
});

test('JSON-LD structured data is present', async ({ page }) => {
  await page.goto('/');
  const jsonLd = page.locator('script[type="application/ld+json"]').first();
  const content = await jsonLd.textContent();
  const parsed = JSON.parse(content!);
  expect(parsed['@type']).toBe('WebApplication');
  expect(parsed.name).toBeTruthy();
  expect(parsed.offers.price).toBe('0');
});

test('sitemap.xml is accessible', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  expect(response?.ok()).toBe(true);
  const content = await response?.text();
  expect(content).toContain('urlset');
});

test('robots.txt is accessible', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.ok()).toBe(true);
  const content = await response?.text();
  expect(content).toMatch(/User-[Aa]gent/);
});

test('keyboard shortcuts overlay opens and closes', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name.includes('Mobile') || browserName !== 'chromium');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('undo/redo via keyboard shortcuts', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto('/');
  await closeBackdropIfOpen(page);
  const titleInput = page.locator('input[type="text"]').first();
  await titleInput.fill('keyboard test');

  const undoButton = page.getByRole('button', { name: 'Undo (Ctrl+Z)' });
  await expect(undoButton).toBeEnabled();

  const redoButton = page.getByRole('button', { name: 'Redo (Ctrl+Y)' });
  await expect(redoButton).toBeDisabled();

  await page.locator('body').press('Control+z');
  await expect(redoButton).toBeEnabled();

  await page.locator('body').press('Control+Shift+z');
  await expect(undoButton).toBeEnabled();
});

test('mobile sidebar backdrop closes sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const sidebarToggle = page.locator('.toolbar-btn-sidebar');
  const sidebar = page.locator('.tool-shell-sidebar');

  if (await page.locator('.sidebar-backdrop').isVisible().catch(() => false)) {
    await expect(sidebar).toHaveClass(/open/);
  } else {
    await sidebarToggle.click();
    await expect(sidebar).toHaveClass(/open/);
  }

  await page.click('.sidebar-backdrop');
  await expect(sidebar).toHaveClass(/collapsed/);
});

test('import from .itsjust.json file works', async ({ page }) => {
  await page.goto('/');
  await closeBackdropIfOpen(page);

  const fileContent = JSON.stringify({
    $schema: 'itsjust-tool',
    toolId: 'template-tool',
    version: '1.0',
    content: { title: 'Imported Title' },
    createdAt: new Date().toISOString(),
  });

  // Use setInputFiles on the hidden file input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.evaluate((el: HTMLInputElement) => {
    el.style.display = 'block';
    el.style.visibility = 'visible';
  });
  await fileInput.setInputFiles({
    name: 'test.itsjust.json',
    mimeType: 'application/json',
    buffer: Buffer.from(fileContent),
  });

  const titleInput = page.locator('input[type="text"]').first();
  await expect(titleInput).toHaveValue('Imported Title');
});

test('export json download triggers', async ({ page }) => {
  await page.goto('/');
  await closeBackdropIfOpen(page);

  const exportButton = page.getByRole('button', { name: /export/i });
  await exportButton.click();

  const jsonOption = page.getByRole('option', { name: /JSON/ });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    jsonOption.click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);
});

test('404 page works', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  const contentType = response?.headers()['content-type'] ?? '';
  expect(contentType).toContain('text/html');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('visual regression — default view', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name.includes('Mobile') || browserName !== 'chromium');
  await page.goto('/');
  await page.waitForSelector('.tool-shell-canvas');
  await expect(page).toHaveScreenshot('tool-default.png', { maxDiffPixels: 100 });
});

// test('visual regression — dark mode', async ({ page }) => {
//   await page.goto('/');
//   await page.waitForSelector('.tool-shell-canvas');
//   const themeButton = page.getByRole('button', { name: /Switch to dark mode/i });
//   if (await themeButton.isVisible()) {
//     await themeButton.click();
//     await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
//     await expect(page).toHaveScreenshot('tool-dark.png', { maxDiffPixels: 100 });
//   }
// });

// test('visual regression — mobile view', async ({ page }) => {
//   await page.setViewportSize({ width: 375, height: 667 });
//   await page.goto('/');
//   await page.waitForSelector('.tool-shell-canvas');
//   await expect(page).toHaveScreenshot('tool-mobile.png', { maxDiffPixels: 100 });
// });
