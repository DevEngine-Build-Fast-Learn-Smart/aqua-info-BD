import { expect, test } from '@playwright/test';

// The previous UI-only suite depended on seeded demo stories. These checks exercise
// real loading/error/empty states without importing sample content into the app.
const initial = {
  version: 1,
  articles: [],
  categories: [],
  videos: [],
  resources: [],
  market: [],
  sections: [{ id: 'lead', name: 'Lead story', nameBn: 'প্রধান প্রতিবেদন', enabled: true }],
  settings: {
    tagline: 'Beyond the Water',
    taglineBn: 'জলের সীমানা ছাড়িয়ে',
    email: '',
    description: '',
    leadArticleId: '',
  },
  counts: { published: 0, drafts: 0, articles: 0, videos: 0 },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('aqua:welcomed', '1'));
  await page.route('**/api/auth/**', (route) =>
    route.fulfill({ status: 401, json: { detail: 'Not signed in.' } }),
  );
});

test('empty publication does not show demo stories', async ({ page }) => {
  await page.route('**/api/site/', (route) => route.fulfill({ json: initial }));
  await page.goto('/home');
  await expect(page.locator('h1')).toContainText('New perspectives are on the horizon.');
  await expect(page.locator('.lead-image')).toHaveCount(0);
});

test('API connection failure exposes a retry action', async ({ page }) => {
  await page.route('**/api/site/', (route) => route.abort());
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: 'The page couldn’t be loaded.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
