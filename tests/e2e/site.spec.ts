import { expect, test, type Page } from '@playwright/test';

/** Collects console errors, uncaught exceptions and failed requests for a page. */
function watchForProblems(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      problems.push(`console ${message.type()}: ${message.text()}`);
  });
  page.on('requestfailed', (request) =>
    problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`),
  );
  return problems;
}

test.describe('GitHub Pages deployment', () => {
  test('the home page loads from the subpath and every request stays under it', async ({
    page,
    baseURL,
  }) => {
    const base = new URL(baseURL!);
    const outside: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin === base.origin && !url.pathname.startsWith(base.pathname))
        outside.push(url.pathname);
    });
    const problems = watchForProblems(page);

    const response = await page.goto('./');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('Inside Java · Understand Java from the inside out');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Understand Java from the inside out.',
    );
    await expect(page.getByRole('link', { name: 'Explore JVM Anatomy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Learning' })).toBeVisible();
    // The live anatomy plate is part of the hero.
    await expect(page.getByRole('button', { name: /^Heap, / }).first()).toBeVisible();

    await page.waitForLoadState('networkidle');
    expect(outside).toEqual([]);
    expect(problems).toEqual([]);
  });

  test('a deep link answers HTTP 200 and keeps its query string', async ({ page }) => {
    const response = await page.goto('anatomy?c=heap');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/anatomy\/?\?c=heap$/);
    await expect(page).toHaveTitle('JVM Anatomy · Inside Java');
    await expect(page.getByRole('heading', { level: 2, name: 'Heap', exact: true })).toBeVisible();
  });

  test('unknown paths answer 404 and still offer a way back', async ({ page, baseURL }) => {
    const response = await page.goto('class-loading/delegation');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { level: 1, name: 'This page could not be found' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Go home' }).click();
    await expect(page).toHaveURL(baseURL!);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Inside Java');
  });
});

test.describe('navigation', () => {
  const pages = [
    ['Learning Paths', 'Learning paths'],
    ['Glossary', 'Glossary'],
    ['References', 'References'],
    ['JVM Anatomy', 'JVM Anatomy'],
  ] as const;

  test('the primary navigation reaches every page', async ({ page, isMobile }) => {
    const problems = watchForProblems(page);
    await page.goto('./');
    for (const [label, heading] of pages) {
      if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
      const nav = page.getByRole('navigation', { name: isMobile ? 'Mobile' : 'Primary' });
      await nav.getByRole('link', { name: new RegExp(`^${label}`) }).click();
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page).toHaveTitle(`${label} · Inside Java`);
    }
    expect(problems).toEqual([]);
  });

  test('the footer links to About and Contributing', async ({ page }) => {
    await page.goto('./');
    const footer = page.getByRole('contentinfo');
    await footer.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveTitle('About · Inside Java');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Contributing' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Contributing' })).toBeVisible();
  });

  test('glossary terms open in place and link to the glossary', async ({ page }) => {
    await page.goto('anatomy?c=heap');
    const inspector = page.getByRole('complementary', { name: 'Component inspector' });
    const term = inspector.locator('button[aria-haspopup="dialog"]').first();
    await term.click();
    const card = page.getByRole('dialog');
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading', { level: 2 })).not.toBeEmpty();
    await card.getByRole('link', { name: 'Open in glossary' }).click();
    await expect(page).toHaveURL(/\/glossary#[a-z0-9-]+$/);
    const id = new URL(page.url()).hash.slice(1);
    await expect(page.locator(`[id="${id}"]`)).toBeFocused();
  });
});

test.describe('offline', () => {
  test.use({ serviceWorkers: 'allow' });

  test('after the first visit the site works offline, including a reload', async ({
    page,
    context,
  }) => {
    await page.goto('./');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await context.setOffline(true);

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Inside Java');

    await page.goto('anatomy?c=interpreter');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Interpreter', exact: true }),
    ).toBeVisible();
    await page.getByRole('radio', { name: /Execution/ }).click();
    await expect(page.getByText('Step 1 of', { exact: false })).toBeVisible();
  });
});
