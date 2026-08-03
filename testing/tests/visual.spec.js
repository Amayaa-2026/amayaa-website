// =============================================================================
// Amayaa — Visual Regression Tests (replaces BackstopJS)
//
// First run:  creates reference screenshots in tests/__screenshots__/
// Later runs: compares against saved references — fails on pixel differences
//
// Update references after intentional visual changes:
//   npx playwright test visual.spec.js --update-snapshots
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';

const PAGES = [
  { label: 'home',    path: '/index.html' },
  { label: 'sarees',  path: '/amayaa_sarees.html' },
  { label: 'blog',    path: '/amayaa_blog.html' },
  { label: 'about',   path: '/amayaa_about.html' },
  { label: 'contact', path: '/amayaa_contact.html' },
  { label: 'offers',  path: '/amayaa_offers.html' },
  { label: 'product', path: '/amayaa_product.html' },
];

for (const pg of PAGES) {
  test(`[visual] ${pg.label} — full page`, async ({ page }, testInfo) => {
    await page.goto(BASE + pg.path);

    // Wait for fonts and animations to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    // Pause CSS animations so screenshots are stable
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }`
    });

    await expect(page).toHaveScreenshot(`${pg.label}-${testInfo.project.name}.png`, {
      fullPage: true,
      // Mask the visitor counter — it changes every run
      mask: [page.locator('.vc'), page.locator('.vd')],
    });
  });
}
