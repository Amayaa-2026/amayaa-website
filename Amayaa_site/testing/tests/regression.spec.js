// =============================================================================
// Amayaa by Polka Dots — Regression Test Suite
// Run BEFORE and AFTER Phase 3 Step 2 (modularisation) to detect regressions.
//
// Prerequisites:
//   cd ~/Downloads/Amayaa_site && python3 -m http.server 8080
//   (keep server running in a separate terminal)
//
// Run:
//   cd ~/Downloads/Amayaa_site/testing
//   npx playwright test
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';

// All 7 public pages
const ALL_PAGES = [
  { label: 'Home',          path: '/index.html' },
  { label: 'Sarees',        path: '/amayaa_sarees.html' },
  { label: 'Blog',          path: '/amayaa_blog.html' },
  { label: 'Our Story',     path: '/amayaa_about.html' },
  { label: 'Contact',       path: '/amayaa_contact.html' },
  { label: 'Special Offers',path: '/amayaa_offers.html' },
  { label: 'Product',       path: '/amayaa_product.html' },
];

// After Step 2: nav.js injects srchOverlay on ALL pages.
const SEARCH_PAGES = [
  '/index.html',
  '/amayaa_sarees.html',
  '/amayaa_blog.html',
  '/amayaa_about.html',
  '/amayaa_contact.html',
  '/amayaa_offers.html',
  '/amayaa_product.html',
];

// Footer link fixtures — must be correct on every page
const FOOTER_SHOP_LINKS = [
  { text: 'All Sarees',     href: 'amayaa_sarees.html' },
  { text: 'New Arrivals',   href: 'amayaa_sarees.html?filter=new' },
  { text: 'Special Offers', href: 'amayaa_offers.html' },
  { text: 'Wedding',        href: 'amayaa_sarees.html?occasion=wedding' },
];
const FOOTER_DISCOVER_LINKS = [
  { text: 'Our Story',  href: 'amayaa_about.html' },
  { text: 'Blog',       href: 'amayaa_blog.html' },
  { text: 'Care Guide', href: 'amayaa_blog.html?cat=care' },
];


// =============================================================================
// GROUP 1 — STRUCTURE: nav + footer present on every page
// =============================================================================
for (const pg of ALL_PAGES) {
  test(`[${pg.label}] nav pill is visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    // Both .nav-pill and .mob-topbar are always in DOM; only one is visible via CSS.
    // Use filter({visible:true}).first() to avoid strict mode violation.
    await expect(page.locator('.nav-pill, .mob-topbar').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has logo seal`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    // Desktop: .nav-seal img; mobile: .mob-seal img
    await expect(page.locator('.nav-seal img, .mob-seal img').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has brand name`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    // Desktop: .nav-brand img; mobile: .mob-brand img
    await expect(page.locator('.nav-brand img, .mob-brand img').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has 6 links`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.nav-links li')).toHaveCount(6);
  });

  test(`[${pg.label}] footer is visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('footer.ft')).toBeVisible();
  });

  test(`[${pg.label}] footer has brand logo`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('footer .fi2 img').first()).toBeVisible();
  });

  test(`[${pg.label}] footer copyright visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.fb2')).toContainText('2026 Amayaa by Polka Dots');
  });

  test(`[${pg.label}] WhatsApp FAB visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.waf')).toBeVisible();
  });

  test(`[${pg.label}] WhatsApp FAB links to correct number`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    const href = await page.locator('.waf').getAttribute('href');
    expect(href).toContain('wa.me/919583946000');
  });

  test(`[${pg.label}] no JS errors on load`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE + pg.path);
    // Allow a brief settle for any deferred scripts
    await page.waitForTimeout(800);
    expect(errors, `JS errors: ${errors.join(' | ')}`).toHaveLength(0);
  });
}


// =============================================================================
// GROUP 2 — FOOTER LINK CORRECTNESS
// These catch bug B1 (broken links in offers.html footer — now fixed in footer.js)
// =============================================================================
for (const pg of ALL_PAGES) {
  for (const link of FOOTER_SHOP_LINKS) {
    test(`[${pg.label}] footer Shop › "${link.text}" href correct`, async ({ page }) => {
      await page.goto(BASE + pg.path);
      const el = page.locator('footer .fc').filter({ hasText: 'Shop' })
                     .locator(`a:has-text("${link.text}")`);
      const href = await el.getAttribute('href');
      expect(href).toContain(link.href);
    });
  }

  for (const link of FOOTER_DISCOVER_LINKS) {
    test(`[${pg.label}] footer Discover › "${link.text}" href correct`, async ({ page }) => {
      await page.goto(BASE + pg.path);
      const el = page.locator('footer .fc').filter({ hasText: 'Discover' })
                     .locator(`a:has-text("${link.text}")`);
      const href = await el.getAttribute('href');
      expect(href).toContain(link.href);
    });
  }
}


// =============================================================================
// GROUP 3 — MOBILE INTERACTIONS
// =============================================================================
test('[Mobile] hamburger opens slide-in panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.mob-topbar')).toBeVisible();
  await page.locator('.mob-ham').click();
  await expect(page.locator('.mob-panel')).toHaveClass(/show/);
  await expect(page.locator('.mob-backdrop')).toHaveClass(/show/);
});

test('[Mobile] backdrop click closes panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await page.locator('.mob-ham').click();
  await expect(page.locator('.mob-panel')).toHaveClass(/show/);
  await page.locator('.mob-backdrop').click();
  await expect(page.locator('.mob-panel')).not.toHaveClass(/show/);
});

test('[Mobile] × button closes panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await page.locator('.mob-ham').click();
  await page.locator('.mob-panel-close').click();
  await expect(page.locator('.mob-panel')).not.toHaveClass(/show/);
});

test('[Mobile] panel has WhatsApp button', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await page.locator('.mob-ham').click();
  await expect(page.locator('.mob-panel-wa')).toBeVisible();
});

test('[Mobile] panel has all 6 nav links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await page.locator('.mob-ham').click();
  await expect(page.locator('.mob-panel-nav a[href]')).toHaveCount(6);
});


// =============================================================================
// GROUP 4 — SEARCH OVERLAY INTERACTIONS
// (Tested on pages that have the overlay; after Step 2, all 7 pages will have it)
// =============================================================================
for (const path of SEARCH_PAGES) {
  const label = path.replace('/', '').replace('.html', '') || 'index';

  test(`[Search][${label}] search button opens overlay`, async ({ page }, testInfo) => {
    // .nav-srch-btn is desktop pill nav only — hidden on mobile viewports by CSS
    if (testInfo.project.name.includes('mobile')) test.skip();
    await page.goto(BASE + path);
    await page.locator('.nav-srch-btn').click();
    await expect(page.locator('.srch-overlay')).toHaveClass(/open/);
  });

  test(`[Search][${label}] search input auto-focuses`, async ({ page }, testInfo) => {
    if (testInfo.project.name.includes('mobile')) test.skip();
    await page.goto(BASE + path);
    await page.locator('.nav-srch-btn').click();
    await expect(page.locator('#srchInput, .srch-bar input').first()).toBeFocused();
  });

  test(`[Search][${label}] close button closes overlay`, async ({ page }, testInfo) => {
    if (testInfo.project.name.includes('mobile')) test.skip();
    await page.goto(BASE + path);
    await page.locator('.nav-srch-btn').click();
    await expect(page.locator('.srch-overlay')).toHaveClass(/open/);
    await page.locator('.srch-close').click();
    await expect(page.locator('.srch-overlay')).not.toHaveClass(/open/);
  });
}


// =============================================================================
// GROUP 5 — GOATCOUNTER: must fire exactly once per page (bug B2 catch)
// Check: only one GoatCounter script tag per page
// =============================================================================
for (const pg of ALL_PAGES) {
  test(`[${pg.label}] GoatCounter script appears exactly once`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    const gcScripts = await page.locator('script[data-goatcounter]').count();
    expect(gcScripts, `Expected 1 GoatCounter script, found ${gcScripts}`).toBe(1);
  });
}


// =============================================================================
// GROUP 6 — HERO SLIDER (home page only)
// =============================================================================
test('[Home] hero slider has 5 slides', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.hero .slide')).toHaveCount(5);
});

test('[Home] hero dot indicators visible', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.dots .dot')).toHaveCount(5);
});

test('[Home] Explore arrow visible on load', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.scroll-hint')).toBeVisible();
});
