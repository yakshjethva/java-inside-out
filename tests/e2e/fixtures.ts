import { test as base, type Page } from '@playwright/test';

export { expect } from '@playwright/test';

/**
 * Prerendered pages are visible before the app has hydrated them, and a click
 * on a control that is not hydrated yet does nothing. These fixtures wait
 * after every navigation until the app has taken over (App sets
 * data-hydrated on <html>), unless JavaScript is disabled.
 */
export const test = base.extend({
  page: async ({ page, javaScriptEnabled }, provide) => {
    if (javaScriptEnabled !== false) {
      const settled = (target: Page) =>
        target
          .waitForFunction(() => document.documentElement.hasAttribute('data-hydrated'), null, {
            timeout: 15_000,
          })
          .catch(() => {
            // Not an app page (or it failed to load): the test's own checks report it.
          });
      const goto = page.goto.bind(page);
      const reload = page.reload.bind(page);
      page.goto = async (...args: Parameters<Page['goto']>) => {
        const response = await goto(...args);
        await settled(page);
        return response;
      };
      page.reload = async (...args: Parameters<Page['reload']>) => {
        const response = await reload(...args);
        await settled(page);
        return response;
      };
    }
    await provide(page);
  },
});
