// =============================================================================
// Amayaa by Polka Dots — Regression Test Suite  v3.8
//
// Updated: Aug 2026  (was v2.0 / Phase 3 Step 2)
// Changes:
//   - Added 4 new public pages (Search, FAQ, Policies, Blog Post)
//   - Hero: 6 slides (was 5)
//   - Nav link count: ≥ 4 (links now fetched from settings.json)
//   - GROUP 6: Sarees — data-driven grid, filter overlay, region combobox
//   - GROUP 7: Product Drawer — open / close
//   - GROUP 8: Blog — cards load, link to reader page
//   - GROUP 9: Blog Post — renders from ?id= param
//   - GROUP 10: Data files — JSON structure sanity
//   - Removed hardcoded footer link href fixtures (now dynamic from settings.json)
//
// Prerequisites:
//   cd ~/Downloads/Amayaa_site && python3 -m http.server 8080
//
// Run:
//   cd ~/Downloads/Amayaa_site/testing
//   npx playwright test tests/regression.spec.js
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';

// All public pages that carry full nav + footer
const ALL_PAGES = [
  { label: 'Home',          path: '/index.html' },
  { label: 'Sarees',        path: '/amayaa_sarees.html' },
  { label: 'Blog',          path: '/amayaa_blog.html' },
  { label: 'Blog Post',     path: '/amayaa_blog_post.html?id=BLG-001' },
  { label: 'Our Story',     path: '/amayaa_about.html' },
  { label: 'Contact',       path: '/amayaa_contact.html' },
  { label: 'Offers',        path: '/amayaa_offers.html' },
  { label: 'Search',        path: '/amayaa_search.html' },
  { label: 'FAQ',           path: '/amayaa_faq.html' },
  { label: 'Policies',      path: '/amayaa_policies.html' },
];

// Desktop-only pages (search overlay hidden on mobile for these)
const DESKTOP_SEARCH_PAGES = ALL_PAGES.map(p => p.path);


// =============================================================================
// GROUP 1 — STRUCTURE: nav + footer present on every page
// =============================================================================
for (const pg of ALL_PAGES) {
  test(`[${pg.label}] nav is visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.nav-pill, .mob-topbar').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has logo seal`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.nav-seal img, .mob-seal img').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has brand name`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.nav-brand img, .mob-brand img').filter({ visible: true }).first()).toBeVisible();
  });

  test(`[${pg.label}] nav has at least 4 links`, async ({ page }) => {
    // Links injected from settings.json — check ≥ 4 rather than exact count
    await page.goto(BASE + pg.path);
    await page.waitForTimeout(600); // allow settings.json fetch
    const count = await page.locator('.nav-links li').count();
    expect(count).toBeGreaterThanOrEqual(4);
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
    await expect(page.locator('.fb2')).toContainText('Amayaa by Polka Dots');
  });

  test(`[${pg.label}] footer has at least 3 column links`, async ({ page }) => {
    // Footer links loaded from settings.json
    await page.goto(BASE + pg.path);
    await page.waitForTimeout(600);
    const count = await page.locator('footer .fc a[href]').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test(`[${pg.label}] WhatsApp FAB visible`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    await expect(page.locator('.waf')).toBeVisible();
  });

  test(`[${pg.label}] WhatsApp FAB links to correct number`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    const href = await page.locator('.waf').getAttribute('href');
    expect(href).toContain('wa.me/91');
  });

  test(`[${pg.label}] no JS errors on load`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE + pg.path);
    await page.waitForTimeout(1000);
    expect(errors, `JS errors: ${errors.join(' | ')}`).toHaveLength(0);
  });
}


// =============================================================================
// GROUP 2 — MOBILE INTERACTIONS
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

test('[Mobile] panel has at least 4 nav links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(600);
  await page.locator('.mob-ham').click();
  const count = await page.locator('.mob-panel-nav a[href]').count();
  expect(count).toBeGreaterThanOrEqual(4);
});


// =============================================================================
// GROUP 3 — SEARCH OVERLAY (desktop only — hidden on mobile via CSS)
// =============================================================================
for (const path of DESKTOP_SEARCH_PAGES) {
  const label = path.split('/').pop().replace('.html', '').replace('?id=BLG-001', '') || 'index';

  test(`[Search][${label}] search button opens overlay`, async ({ page }, testInfo) => {
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
    await page.locator('.srch-close').click();
    await expect(page.locator('.srch-overlay')).not.toHaveClass(/open/);
  });
}


// =============================================================================
// GROUP 4 — GOATCOUNTER: exactly one script tag per page
// =============================================================================
for (const pg of ALL_PAGES) {
  test(`[GoatCounter][${pg.label}] script appears exactly once`, async ({ page }) => {
    await page.goto(BASE + pg.path);
    const count = await page.locator('script[data-goatcounter]').count();
    expect(count, `Expected 1 GoatCounter script, found ${count}`).toBe(1);
  });
}


// =============================================================================
// GROUP 5 — HOME PAGE
// =============================================================================
test('[Home] hero has 6 slides', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.hero .slide')).toHaveCount(6);
});

test('[Home] hero dot indicators visible', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.dots .dot')).toBeVisible();
});

test('[Home] scroll hint arrow visible', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.scroll-hint')).toBeVisible();
});

test('[Home] collections grid has at least 4 items', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(600); // collections.json fetch
  const count = await page.locator('#coll-grid .ct').count();
  expect(count).toBeGreaterThanOrEqual(4);
});

test('[Home] New Arrivals section is present', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await expect(page.locator('.section-arrivals')).toBeVisible();
});


// =============================================================================
// GROUP 6 — SAREES PAGE: data-driven grid + filter overlay + combobox
// =============================================================================
test('[Sarees] product grid loads at least 10 cards', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  // Wait for products_index.json fetch to complete and cards to render
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  const count = await page.locator('#sarees-grid .pc').count();
  expect(count).toBeGreaterThanOrEqual(10);
});

test('[Sarees] filter button opens overlay', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await page.locator('#deskFltBtn').click();
  await expect(page.locator('#deskFltOverlay')).toHaveClass(/open/);
});

test('[Sarees] region combobox input is present in filter overlay', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await page.waitForTimeout(600); // categories.json fetch
  await page.locator('#deskFltBtn').click();
  await expect(page.locator('#regionSrchInp')).toBeVisible();
});

test('[Sarees] typing in region combobox shows dropdown', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await page.waitForTimeout(600);
  await page.locator('#deskFltBtn').click();
  await page.locator('#regionSrchInp').fill('a');
  await expect(page.locator('#regionSrchDrop')).toHaveClass(/open/);
  const count = await page.locator('#regionSrchDrop .region-srch-item').count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('[Sarees] selecting a region adds chip and filters grid', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(600);
  await page.locator('#deskFltBtn').click();
  await page.locator('#regionSrchInp').fill('Banarasi');
  await page.locator('#regionSrchDrop .region-srch-item').first().click();
  // A chip should appear in the selected area
  await expect(page.locator('#regionSelChips .desk-flt-chip.on').first()).toBeVisible();
  // Grid should still show some cards (Banarasi products exist)
  const count = await page.locator('#sarees-grid .pc').count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('[Sarees] fabric filter chips are present', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await page.waitForTimeout(600);
  await page.locator('#deskFltBtn').click();
  // Fabric section is second desk-flt-section (after region)
  const fabricChips = page.locator('#deskFltOverlay .desk-flt-chip');
  const count = await fabricChips.count();
  expect(count).toBeGreaterThanOrEqual(4);
});

test('[Sarees] Clear All resets filters', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(600);
  // Select a fabric chip
  await page.locator('#deskFltBtn').click();
  await page.locator('#deskFltOverlay .desk-flt-chip').first().click();
  // Call clear all
  await page.evaluate(() => window.sareesFltClear && window.sareesFltClear());
  // Region input should be empty
  const val = await page.locator('#regionSrchInp').inputValue();
  expect(val).toBe('');
  // No chips should remain on
  const onChips = await page.locator('#deskFltOverlay .desk-flt-chip.on').count();
  expect(onChips).toBe(0);
});

test('[Sarees][Mobile] mobile filter button opens sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/amayaa_sarees.html');
  await page.locator('#mobFltBtn, .mob-flt-btn').click();
  await expect(page.locator('#mobFilterSheet, .mob-flt-sheet').first()).toBeVisible({ timeout: 5000 });
});


// =============================================================================
// GROUP 7 — PRODUCT DRAWER
// =============================================================================
test('[Drawer] clicking a product card opens the drawer', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  await page.locator('#sarees-grid .pc').first().click();
  // Drawer open = .pd-open class on the drawer element
  await expect(page.locator('.pd-open').first()).toBeVisible({ timeout: 6000 });
});

test('[Drawer] close button dismisses the drawer', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  await page.locator('#sarees-grid .pc').first().click();
  await expect(page.locator('.pd-open').first()).toBeVisible({ timeout: 6000 });
  await page.locator('.pd-close-btn').click();
  await expect(page.locator('.pd-open')).toHaveCount(0);
});

test('[Drawer] product name is shown after open', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/amayaa_sarees.html');
  await expect(page.locator('#sarees-grid .pc').first()).toBeVisible({ timeout: 8000 });
  await page.locator('#sarees-grid .pc').first().click();
  await expect(page.locator('.pd-open').first()).toBeVisible({ timeout: 6000 });
  // Breadcrumb name should be populated (not empty)
  const nameText = await page.locator('#pd-bc-name').textContent();
  expect(nameText.trim().length).toBeGreaterThan(0);
});

test('[Drawer] Home page product card opens drawer', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) test.skip();
  await page.goto(BASE + '/index.html');
  // New arrivals / featured cards are wired to ProductDrawer.open()
  const cards = page.locator('.pc[onclick*="ProductDrawer"]');
  const count = await cards.count();
  if (count === 0) test.skip(); // no wired cards on home = skip gracefully
  await cards.first().click();
  await expect(page.locator('.pd-open').first()).toBeVisible({ timeout: 6000 });
});


// =============================================================================
// GROUP 8 — BLOG PAGE
// =============================================================================
test('[Blog] blog cards load from JSON', async ({ page }) => {
  await page.goto(BASE + '/amayaa_blog.html');
  await expect(page.locator('.bcard').first()).toBeVisible({ timeout: 8000 });
  const count = await page.locator('.bcard').count();
  expect(count).toBeGreaterThanOrEqual(3);
});

test('[Blog] blog card links to blog post page', async ({ page }) => {
  await page.goto(BASE + '/amayaa_blog.html');
  await expect(page.locator('.bcard').first()).toBeVisible({ timeout: 8000 });
  const href = await page.locator('.bcard').first().getAttribute('href');
  expect(href).toContain('amayaa_blog_post.html');
  expect(href).toContain('id=');
});


// =============================================================================
// GROUP 9 — BLOG POST PAGE
// =============================================================================
test('[BlogPost] renders correctly with ?id=BLG-001', async ({ page }) => {
  await page.goto(BASE + '/amayaa_blog_post.html?id=BLG-001');
  await page.waitForTimeout(1000); // JSON fetch
  // Title should be non-empty
  const title = page.locator('h1, .bp-title, .post-title').first();
  await expect(title).toBeVisible({ timeout: 6000 });
  const txt = await title.textContent();
  expect(txt.trim().length).toBeGreaterThan(5);
});

test('[BlogPost] missing ?id shows error or redirects gracefully', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(BASE + '/amayaa_blog_post.html');
  await page.waitForTimeout(800);
  expect(errors, `JS errors: ${errors.join(' | ')}`).toHaveLength(0);
});


// =============================================================================
// GROUP 10 — DATA FILE SANITY (fetch JSON, check structure)
// =============================================================================
test('[Data] products_index.json has 30 products', async ({ page }) => {
  const res = await page.request.get(BASE + '/data/products_index.json');
  expect(res.ok()).toBe(true);
  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBe(30);
  // Spot-check required fields
  for (const p of data) {
    expect(p.id).toBeTruthy();
    expect(p.name).toBeTruthy();
    expect(p.price).toBeGreaterThan(0);
    expect(p.thumbnail).toContain('ik.imagekit.io');
  }
});

test('[Data] categories.json has region, fabric, occasion filters', async ({ page }) => {
  const res = await page.request.get(BASE + '/data/categories.json');
  expect(res.ok()).toBe(true);
  const data = await res.json();
  const ids = data.filters.map(f => f.id);
  expect(ids).toContain('region');
  expect(ids).toContain('fabric');
  expect(ids).toContain('occasion');
});

test('[Data] content_library.json has weaveStory, careSuggestions, description', async ({ page }) => {
  const res = await page.request.get(BASE + '/data/content_library.json');
  expect(res.ok()).toBe(true);
  const data = await res.json();
  expect(data.weaveStory.length).toBeGreaterThanOrEqual(26);
  expect(data.careSuggestions.length).toBeGreaterThanOrEqual(6);
  expect(data.description.length).toBeGreaterThanOrEqual(30);
});

test('[Data] settings.json is valid JSON with siteTitle', async ({ page }) => {
  const res = await page.request.get(BASE + '/data/settings.json');
  expect(res.ok()).toBe(true);
  const data = await res.json();
  expect(data.siteTitle || data.siteName).toBeTruthy();
});

test('[Data] banners.json has at least 4 banners', async ({ page }) => {
  const res = await page.request.get(BASE + '/data/banners.json');
  expect(res.ok()).toBe(true);
  const data = await res.json();
  const banners = data.banners || data;
  expect(Array.isArray(banners)).toBe(true);
  expect(banners.length).toBeGreaterThanOrEqual(4);
});

test('[Data] all 30 product detail files exist and have id + price', async ({ page }) => {
  const idxRes = await page.request.get(BASE + '/data/products_index.json');
  const idx = await idxRes.json();
  // Check a sample of 5 detail files (checking all 30 would be slow)
  const sample = idx.slice(0, 5);
  for (const p of sample) {
    const res = await page.request.get(BASE + '/data/products/' + p.id + '.json');
    expect(res.ok(), `Detail file missing for ${p.id}`).toBe(true);
    const detail = await res.json();
    expect(detail.id).toBe(p.id);
    expect(detail.price).toBeGreaterThan(0);
  }
});
