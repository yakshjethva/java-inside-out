import { expect, test, type Page } from '@playwright/test';

const inspector = (page: Page) => page.getByRole('complementary', { name: 'Component inspector' });
const plateNode = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(`^${name}, `) });

test.describe('JVM anatomy explorer', () => {
  test('selecting a component on the plate opens it in the inspector', async ({ page }) => {
    await page.goto('anatomy');
    await plateNode(page, 'Interpreter').click();
    await expect(
      inspector(page).getByRole('heading', { level: 2, name: 'Interpreter', exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\?c=interpreter$/);
    await expect(inspector(page).getByText('Sources')).toBeVisible();
  });

  test('relationships and breadcrumbs navigate between components', async ({ page }) => {
    await page.goto('anatomy?c=heap');
    const panel = inspector(page);
    await panel.getByRole('button', { name: 'Garbage collector', exact: true }).first().click();
    await expect(
      panel.getByRole('heading', { level: 2, name: 'Garbage collector', exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/c=garbage-collector/);

    await panel
      .getByRole('navigation', { name: 'Component breadcrumb' })
      .getByRole('button', { name: 'Java Virtual Machine' })
      .click();
    await expect(page).toHaveURL(/c=jvm/);

    await page.goBack();
    await expect(page).toHaveURL(/c=garbage-collector/);
    await page.goBack();
    await expect(page).toHaveURL(/c=heap/);
  });

  test('the diagram is keyboard operable', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is exercised on desktop.');
    await page.goto('anatomy?c=heap');
    const heap = plateNode(page, 'Heap');
    await heap.focus();
    await page.keyboard.press('Escape');
    await expect(plateNode(page, 'Runtime data areas')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/c=runtime-data-areas/);
    await page.keyboard.press('ArrowRight');
    await expect(plateNode(page, 'Runtime data areas')).not.toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).not.toHaveURL(/c=runtime-data-areas/);
  });

  test('the component list filters and selects', async ({ page }) => {
    await page.goto('anatomy');
    await page.getByRole('button', { name: 'Components' }).click();
    const list = page.getByRole('complementary', { name: 'Component list' });
    await list.getByRole('searchbox', { name: 'Filter components' }).fill('code cache');
    await list.getByRole('treeitem', { name: /Code cache/ }).click();
    await expect(page).toHaveURL(/c=code-cache/);
  });

  test('layers can hide HotSpot implementation structures', async ({ page }) => {
    await page.goto('anatomy');
    await expect(plateNode(page, 'Code cache')).toBeVisible();
    await page.getByRole('button', { name: 'Layers' }).click();
    await page.getByRole('checkbox', { name: /HotSpot implementation structures/ }).uncheck();
    await expect(plateNode(page, 'Code cache')).toHaveCount(0);
    await expect(plateNode(page, 'Method area')).toBeVisible();
  });

  test('exploded mode numbers every part', async ({ page }) => {
    await page.goto('anatomy');
    await page.getByRole('radio', { name: /Exploded/ }).click();
    await expect(page).toHaveURL(/mode=exploded/);
    await expect(page.getByText('Parts list')).toBeVisible();
    await page.getByRole('button', { name: /^\d+\s*Code cache$/ }).click();
    await expect(page).toHaveURL(/c=code-cache/);
  });

  test('internal mode dissects the selected component', async ({ page }) => {
    await page.goto('anatomy?c=heap&mode=internal');
    await expect(page.getByText('Inside the heap')).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Accuracy note' }).first()).toContainText(
      'illustrative',
    );
  });

  test('execution mode steps through a scenario', async ({ page }) => {
    await page.goto('anatomy?mode=execution&s=new-person');
    const narrative = page.getByRole('complementary', { name: 'Execution narrative' });
    await expect(narrative.getByText('Step 1 of 10')).toBeVisible();
    await narrative.getByRole('button', { name: 'Next step' }).click();
    await expect(narrative.getByText('Step 2 of 10')).toBeVisible();
    await expect(page).toHaveURL(/step=1/);
    await narrative.getByRole('button', { name: 'Step 5:', exact: false }).click();
    await expect(narrative.getByText('Step 5 of 10')).toBeVisible();
  });

  test('the Focus button works while the camera follows a scenario', async ({ page }) => {
    await page.goto('anatomy?mode=execution&s=new-person&c=native-libraries');
    const canvas = page.getByRole('group', { name: 'Anatomy of the Java Virtual Machine' });
    const node = plateNode(page, 'Native libraries');
    const centred = async () => {
      const [area, box] = await Promise.all([canvas.boundingBox(), node.boundingBox()]);
      if (!area || !box) return false;
      const dx = box.x + box.width / 2 - (area.x + area.width / 2);
      const dy = box.y + box.height / 2 - (area.y + area.height / 2);
      return Math.abs(dx) < area.width * 0.15 && Math.abs(dy) < area.height * 0.15;
    };
    await expect(page.getByText('Step 1 of 10')).toBeVisible();
    // The camera starts on the step's components, not on the selection.
    await expect.poll(centred).toBe(false);
    await page.getByRole('button', { name: 'Focus' }).click();
    await expect.poll(centred).toBe(true);
    // The next step takes the camera back.
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect.poll(centred).toBe(false);
  });

  test('the home page plate opens a component in the explorer', async ({ page }) => {
    await page.goto('./');
    await plateNode(page, 'Interpreter').click();
    await page.getByRole('link', { name: 'Open in the explorer' }).click();
    await expect(page).toHaveURL(/\/anatomy\/?\?c=interpreter$/);
    await expect(
      inspector(page).getByRole('heading', { level: 2, name: 'Interpreter', exact: true }),
    ).toBeVisible();
  });
});
