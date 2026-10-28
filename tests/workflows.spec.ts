import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('aqua:welcomed', '1');
    sessionStorage.setItem('aqua:editorial-session:v1', 'workspace-owner');
  });
});

test('public and admin render with local images, fonts, and clean URLs', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.locator('h1')).toContainText('Building a Resilient Future');
  await page
    .locator('img')
    .evaluateAll((images) =>
      images.forEach((image) => ((image as HTMLImageElement).loading = 'eager')),
    );
  await page.locator('.public-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.lead-image img')).toHaveJSProperty('naturalWidth', 1600);
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('16px Kalpurush', 'বাংলা');
      await document.fonts.load('16px "Source Serif 4"');
      await document.fonts.ready;
      return (
        document.fonts.check('16px Kalpurush') && document.fonts.check('16px "Source Serif 4"')
      );
    }),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(
    page.getByRole('heading', { name: 'A good day for a new perspective.' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('drafts remain private until published, then persist and open by slug', async ({ page }) => {
  await page.goto('/admin/articles/new');
  await page.getByLabel('STORY HEADLINE').fill('Community ponds, a shared future');
  await page.getByLabel('STORY SUMMARY').fill('A field report from the local community.');
  await page
    .getByLabel('THE STORY')
    .fill(
      'A careful report from the water.\n\nPeople and place\n\nA more detailed field perspective.',
    );
  await page.getByLabel('AUTHOR').fill('Test Editor');
  await page.getByLabel('FIELD LOCATION').fill('Mymensingh');
  await page.getByRole('button', { name: 'বাংলা' }).click();
  await page.getByLabel('বাংলা শিরোনাম').fill('সবার পুকুর সবার ভবিষ্যৎ');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);
  await page.goto('/news');
  await expect(page.getByRole('heading', { name: 'Community ponds, a shared future' })).toHaveCount(
    0,
  );
  await page.goto('/admin/articles');
  await page
    .getByRole('link', { name: 'Community ponds, a shared future Test Editor', exact: true })
    .click();
  await page.getByRole('combobox', { name: 'STATUS', exact: true }).selectOption('published');
  await page.getByRole('button', { name: 'Save & publish locally' }).click();
  await page.goto('/articles/community-ponds-a-shared-future');
  await expect(page.locator('h1')).toHaveText('Community ponds, a shared future');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Community ponds, a shared future');
  await page.getByRole('button', { name: 'বাংলা', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('সবার পুকুর সবার ভবিষ্যৎ');
});

test('homepage controls update public preview across tabs', async ({ page, context }) => {
  const publicPage = await context.newPage();
  await publicPage.goto('/home');
  await expect(publicPage.locator('.video-section')).toBeVisible();
  await page.goto('/admin/homepage');
  await page.getByLabel('FEATURED ARTICLE').selectOption('a2');
  await page.getByRole('switch', { name: 'Show Video & field reports', exact: true }).click();
  await page
    .getByRole('button', { name: 'Move Knowledge hub & worksheets up', exact: true })
    .click();
  await expect(publicPage.locator('h1')).toContainText('Next Chapter');
  await expect(publicPage.locator('.video-section')).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('switch', { name: 'Show Video & field reports', exact: true }),
  ).toHaveAttribute('aria-checked', 'false');
});

test('edited benchmark appears in the public ticker and market table', async ({ page }) => {
  await page.goto('/admin/market');
  await page.getByRole('spinbutton', { name: 'Pangasius price' }).fill('210');
  await page.getByRole('spinbutton', { name: 'Pangasius change' }).fill('-3.5');
  await page.getByRole('button', { name: 'Save benchmark' }).click();
  await page.goto('/home');
  await expect(page.locator('.market-rates')).toContainText('৳210');
  await page.goto('/market');
  const row = page.getByRole('row').filter({ hasText: 'Pangasius' });
  await expect(row).toContainText('৳210');
  await expect(row).toContainText('3.5%');
});

test('search, saved stories, and language switch work together', async ({ page }) => {
  await page.goto('/home');
  await page.locator('.masthead-search').click();
  await page.getByPlaceholder('Search stories, species, research…').fill('nitrate');
  await expect(page.locator('.search-results > a')).toHaveCount(1);
  await page.locator('.search-results > a').click();
  await expect(page.locator('h1')).toContainText('Managing Nitrate Spikes');
  await page.getByRole('button', { name: 'Save to reading list' }).click();
  await page.goto('/saved');
  await expect(page.locator('.archive-grid .article-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'বাংলা', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('h1')).toHaveText('আপনার পাঠতালিকা');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('.archive-grid .article-card')).toHaveCount(1);
});

test('worksheets calculate results from user inputs', async ({ page }) => {
  await page.goto('/knowledge-hub');
  await page.getByRole('button', { name: 'Launch calculator' }).click();
  await page.getByLabel('Length (m)').fill('20');
  await page.getByLabel('Width (m)').fill('10');
  await page.getByLabel('Average depth (m)').fill('1.5');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  await expect(page.locator('.calculator-result')).toContainText('300 m³');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open worksheet' }).click();
  await page.getByLabel('Feed used (kg)').fill('150');
  await page.getByLabel('Biomass gained (kg)').fill('100');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  await expect(page.locator('.calculator-result')).toContainText('1.5 FCR');
});

test('video preview, dialog keyboard behavior, and newsletter demo are honest and usable', async ({
  page,
}) => {
  await page.goto('/videos');
  await page.getByRole('button', { name: 'Preview field report', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Documentary footage will be connected');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Preview field report', exact: true }).first(),
  ).toBeFocused();
  await page.goto('/subscription');
  await page.locator('#dispatch-email').fill('reader@example.com');
  await page.locator('.dispatch-panel').getByRole('button', { name: 'Get the Dispatch' }).click();
  await expect(page.locator('.dispatch-panel')).toContainText('no email has been sent');
});

test('new categories have working public routes', async ({ page }) => {
  await page.goto('/admin/categories');
  await page.getByRole('button', { name: 'Add a category' }).click();
  await page.getByLabel('CATEGORY NAME').fill('River Communities');
  await page.getByLabel('BANGLA NAME').fill('নদীর মানুষ');
  await page.getByLabel('DESCRIPTION').fill('Perspectives from river communities.');
  await page.getByRole('button', { name: 'Save category' }).click();
  await page.goto('/river-communities');
  await expect(page.locator('h1')).toHaveText('River Communities');
  await expect(page.getByRole('heading', { name: 'No stories found.' })).toBeVisible();
  await page.goto('/a-page-that-does-not-exist');
  await expect(page.getByRole('heading', { name: 'A little off course.' })).toBeVisible();
});

test('video and knowledge collection edits reach the public view', async ({ page }) => {
  await page.goto('/admin/videos');
  await page.getByRole('button', { name: 'Edit report' }).first().click();
  await page.getByLabel('TITLE *', { exact: true }).fill('A new view from the Meghna');
  await page.getByRole('button', { name: 'Save locally' }).click();
  await page.goto('/videos');
  await expect(page.getByRole('heading', { name: 'A new view from the Meghna' })).toBeVisible();
  await page.goto('/admin/resources');
  await page.getByRole('button', { name: 'Edit resource' }).first().click();
  await page.getByLabel('TITLE *', { exact: true }).fill('A clearer pond volume worksheet');
  await page.getByRole('button', { name: 'Save locally' }).click();
  await page.goto('/knowledge-hub');
  await expect(
    page.getByRole('heading', { name: 'A clearer pond volume worksheet' }),
  ).toBeVisible();
});

test('publication settings persist in the public masthead', async ({ page }) => {
  await page.goto('/admin/settings');
  await page.getByLabel('TAGLINE *', { exact: true }).fill('Perspectives from the Delta');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.goto('/home');
  await expect(page.locator('.masthead .brand')).toContainText('Perspectives from the Delta');
});

for (const width of [320, 390, 768]) {
  test(`public and admin routes fit a ${width}px viewport without overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of [
      '/home',
      '/news',
      '/articles/resilient-future-inland-aquaculture',
      '/knowledge-hub',
      '/videos',
      '/market',
      '/admin/',
      '/admin/homepage',
      '/admin/articles',
      '/admin/articles/new',
      '/admin/videos',
      '/admin/resources',
      '/admin/market',
      '/admin/categories',
      '/admin/settings',
    ]) {
      await page.goto(path);
      await expect(page.locator('main').first()).toBeVisible();
      await page.locator('main').first().locator('h1, h2').first().waitFor();
      const dimensions = await page.evaluate(() => ({
        width: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `Horizontal overflow at ${path}`).toBeLessThanOrEqual(
        dimensions.width,
      );
    }
    expect(errors).toEqual([]);
    if (width === 390) {
      await page.goto('/home');
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach((image) => (image.loading = 'eager'));
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, (image) => image.decode()));
      });
      await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await page.locator('.nav-links').getByRole('link', { name: 'News', exact: true }).click();
      await expect(page).toHaveURL(/\/news$/);
      await page.goto('/admin/');
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, (image) => image.decode()));
      });
      await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('link', { name: /Stories & field reports/ }).click();
      await expect(page).toHaveURL(/\/admin\/articles$/);
    }
  });
}
