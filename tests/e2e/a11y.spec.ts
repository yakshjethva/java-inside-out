import { createRequire } from 'node:module';
import { expect, test } from './fixtures';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

/**
 * Automated WCAG 2.2 A and AA checks (axe-core) on every kind of page. Two
 * exclusions, both verified by hand:
 *  - label-content-name-mismatch is an experimental axe rule. The 2D plate's
 *    parts are buttons whose names start with their visible label and add
 *    context (provenance, state), which that rule cannot tell apart.
 *  - On the glossary, target-size is measured for terms far below the fold,
 *    which the browser has not laid out yet (content-visibility); scrolled into
 *    view, nothing covers them.
 */
const pages = [
  './',
  'start',
  'start?chapter=memory',
  'learn',
  'learn/heap-vs-stack',
  'anatomy',
  'anatomy?c=heap',
  'anatomy?viewer=list',
  'anatomy?mode=execution&s=jit',
  'glossary',
  'references',
  'about',
  'contributing',
  'no-such-page',
];

test.describe('automated accessibility checks', () => {
  for (const path of pages)
    test(`${path} has no WCAG 2.2 A or AA violations`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem(
          'inside-java:v1:preferences',
          JSON.stringify({
            level: 'simple',
            motion: 'system',
            mapView: 'overview',
            dismissed: { 'explorer-tour': 1 },
          }),
        );
      });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.addScriptTag({ path: axePath });
      const violations = await page.evaluate(async (glossary) => {
        const axe = (
          window as unknown as {
            axe: {
              run: (context: Document, options: object) => Promise<{ violations: unknown[] }>;
            };
          }
        ).axe;
        const result = await axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
          rules: {
            'label-content-name-mismatch': { enabled: false },
            ...(glossary ? { 'target-size': { enabled: false } } : {}),
          },
        });
        return (result.violations as { id: string; nodes: { target: string[] }[] }[]).map(
          (violation) =>
            `${violation.id}: ${violation.nodes.map((n) => n.target.join(' ')).join(', ')}`,
        );
      }, path === 'glossary');
      expect(violations).toEqual([]);
    });
});
