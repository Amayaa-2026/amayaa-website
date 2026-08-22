# Amayaa by Polka Dots — Master Change Log
## All phases · All revisions

---

## VERSION HISTORY

| Tag | Date | Description |
|---|---|---|
| v1.0 | Jun 2026 | Initial site launch — 7 static HTML pages, inline nav/footer, no JS modules |
| v1.5 | Jul 2026 | Admin panel foundation, data/*.json scaffold, GoatCounter analytics |
| v2-baseline | Jul 2026 | Snapshot before modularisation (pre-nav.js) |
| v2.0 | Jul 2026 | Phase 3 Step 2 complete — nav.js, footer.js, public.css; all 7 pages modularised |
| v2.6 | Aug 8 2026 | Phase 3 Step 3 complete — search overlay, amayaa_search.html, product-drawer v6, mobile RWD |
| v2.7 | Aug 10 2026 | Phase 3 Step 4 complete — sarees filter redesign (desktop + mobile), global footer + mobile layout fixes |
| **v2.8** | **Aug 11 2026** | **Data-driven sarees grid, ProductDrawer wired to homepage, hero banner with 6 real images** |
| **v2.9** | **Aug 11 2026** | **FAQ & Policy pages, footer update, preview gate (coming_soon.html), logo home link** |
| **v3.0** | **Aug 11 2026** | **Admin traceability matrix, FAQ/Policies JSON + admin pages, hero banners JSON-driven, typography orb picker (10 pages)** |
| **v3.1** | **Aug 12 2026** | **All dummy/partial admin pages wired to GitHub API. All public pages JSON-driven (About, Blog, Contact, Offers, Search, Home). Traceability matrix updated with Code Push column + Token reminder.** |
| **v3.2** | **Aug 15 2026** | **Content Library system, Product Edit full rewrite, QR code in product drawer, Quick-view panel in Product Manager, Offers page drawer fix.** |
| **v3.3** | **Aug 16 2026** | **Bulk Upload admin page — add new records or update existing ones via Excel for Products, Categories, and Content Library. Advanced filter-based search with pre-filled Excel download. Collections image upgrade, Admin Settings tab redesign. Removed redundant Special Offers nav link. Admin sidebar scrollbar redesigned — dark themed, no white flash.** |
| **v3.4** | **Aug 17 2026** | **Hero fold bar restructured (trust strip moved to 15vh gap). Blog post reader page. Blog page + admin editor data-driven. Our Story enriched (3rd section, 4 weaver profiles, values). Silk Mark replaces GI Tag sitewide. Trust strip items swapped. Section header typography system added.** |
| **v3.5** | **Aug 22 2026** | **Our Story UI redesign (horizontal weaver cards, 4-col promise grid, font fixes). 30 product catalogue (18 new sarees, full regional/fabric/occasion diversity). Offers page: dynamic count, sort+filter fully wired, chips+sort on same row. Sarees sort bug fixed. Product drawer GST fine print. Blog content BLG-001–006 fully written with govt source credits.** |
| **v3.6** | **Aug 22 2026** | **GoatCounter visitor count fix: Homepage #vc and Admin Dashboard "Total Visitors" now read live count from data/settings.json (siteStats.visitorCount). Dashboard "Refresh from GoatCounter" button fetches GoatCounter API (token from localStorage amayaa_gc_token), saves count + lastSynced back to settings.json via GitHub API.** |
| **v3.7** | **Aug 22 2026** | **ImageKit.io CDN integration: All image paths migrated from local images/ to https://ik.imagekit.io/Amayaa2026/ across all data JSONs and HTML. Admin upload flows for banners and blog now use ImageKit Upload API instead of GitHub API. Product Edit now has a working photo upload panel. Shared imagekit.js helper created. ImageKit private key manageable from Admin Settings.** |
| **v3.8** | **Aug 22 2026** | **Content Library fully populated (6 fabric care templates, 26 weave stories, 30 descriptions). All 30 products wired to library. Occasion "casual/daily" → "regular" sitewide. Product Edit page fully wired to GitHub API. contentRefs denorm (30→1 fetch). Sarees Region/Weave filter: searchable combobox replaces 28 chips. Admin fixes: products index path, delete helper, category usage-check. ImageKit migration completed across remaining admin/public pages. Local images-bkp folder removed from git.** |

---

## 🚧 TODO — Remaining Admin Gaps (Aug 12 2026)

The following two admin pages remain **dummy/unconnected** and require code implementation before they can be used. Both need a git push after implementation.

---

### TODO-1: `amayaa_admin/amayaa_product_edit.html` — Product Edit Page

**Status:** Dummy — UI exists but Save does nothing  
**Effort:** High (complex multi-file write)  
**Priority:** High — needed before products can be managed end-to-end

**What needs building:**
- On load: read `?id=` param from URL, fetch `data/products/{id}.json` via GitHub API, populate all form fields (SKU, name, pricing, region, fabric, occasion, description, weave story, care, colour swatches, status)
- Region and Fabric dropdowns: fetch from `data/categories.json` (currently hardcoded)
- On Save & Publish: GitHub API PUT to `data/products/{id}.json` AND update the corresponding entry in `data/products_index.json` (name, price, originalPrice, status, region, fabric, featured)
- On New Product: generate new UUID/SKU, create `data/products/{id}.json`, append to `products_index.json`
- Image upload: file picker → base64 → GitHub API PUT to `images/products/{id}/img1.jpg` etc. → store path in product JSON
- Status toggle: `active` / `sold` / `hidden` — reflected in both product JSON and index

**Files affected:** `amayaa_admin/amayaa_product_edit.html`, `data/products_index.json`, `data/products/{id}.json`  
**Code push required:** Yes (to deploy the implementation) — then all future product saves are API-only (no further pushes)

---

### TODO-2: `amayaa_admin/amayaa_typography.html` — Typography Admin Page

**Status:** Dummy — controls render but Save Draft only updates a timestamp span  
**Effort:** Medium  
**Priority:** Medium — currently workaround is editing typography.json directly

**What needs building:**
- On load: fetch `data/typography.json` via GitHub API, populate all pickers/sliders/colour inputs for both "Public Website" and "Admin Panel" tabs
- On save: collect all values from controls → build typography.json object → GitHub API PUT
- Public pages need to fetch `typography.json` on load and apply CSS variables (currently only the admin panel tab reads it; the Public Website tab is read-only preview)

**Files affected:** `amayaa_admin/amayaa_typography.html`, `data/typography.json`, public pages (to add fetch + CSS var injection)  
**Code push required:** Yes (to deploy) — then typography changes are API-only

---

### TODO-3: Dashboard — Visitor & WA Click Counts (GoatCounter + Cloudflare Worker)

**Status:** Hardcoded placeholder — no data source  
**Effort:** Medium  
**Priority:** Low — cosmetic on dashboard, not blocking

**Plan agreed:**
- Visitor count: fetch from GoatCounter API (`https://amayaa.goatcounter.com/api/v0/stats/hits`) with API token
- WhatsApp click count: on every WA button click, fire to a Cloudflare Worker (free tier) → Worker increments KV counter OR registers as GoatCounter custom event → Dashboard fetches and displays

**Code push required:** Yes (Cloudflare Worker deploy + dashboard wiring)

---

## NEXT SESSION PLAN — Pending Design Decisions & Backlog (Aug 11 2026)

Three topics raised, answers agreed, implementation deferred.

---

### PLAN-A · Remaining "JSON Not Implemented" Items (15 items across traceability matrix)

Priority order agreed for next sessions:

**Priority 1 — Sarees filter chips wired to categories.json**
- Admin › Categories already exists but sarees page filter chips are still hardcoded in HTML
- Wire desktop filter overlay chips + mobile sidebar chips to fetch `data/categories.json`
- Same for the Sort dropdown options
- Pages affected: `amayaa_sarees.html`

**Priority 2 — Offers page: hero + stats bar + occasion/filter rows from offers.json**
- Admin › Special Offers page exists but `amayaa_offers.html` ignores it
- Wire: hero banner text, "52+ sarees" stats bar, Occasion filter row, Filter dropdowns
- JSON: `data/offers.json`

**Priority 3 — Nav links and Footer columns from settings.json**
- Nav pill labels/hrefs hardcoded in `nav.js`
- Footer column links hardcoded in `nav.js`
- Add `settings.json › nav.links[]` and `settings.json › footer.columns[]`
- Admin: add to Admin › Settings page

**Priority 4 — Collections grid from new collections.json**
- 6 collection tiles on index.html (Banarasi, Kanjivaram, etc.) hardcoded
- New file: `data/collections.json`
- New admin page: Admin › Collections (or fold into Admin › Categories)

**Low priority / UI only**
- Typography Live Preview: currently previews Admin panel styles only, not public site. Enhancement, not blocking.
- Related Products in product drawer: driven by products.json tags/region match. Needs logic, no new data.
- Search page hero band gradient: add to `typography.json › pageThemes.search` and wire

Full details in `admin_traceability.html` — filter by "JSON: No" to see all 15 rows.

---

### PLAN-B · Coming Soon Toggle — Cross-Device Fix

**Problem:** Current `gate.js` uses a session cookie set by visiting `?preview=amayaa2026`. This is browser+device specific — a new laptop/phone has no cookie and always hits the coming soon page.

**Agreed solution:** Make `gate.js` read `settings.json` synchronously before deciding whether to redirect.

**How it works:**
- Add `comingSoon: true` flag to `settings.json › siteControls`
- `gate.js` does a synchronous XHR (`new XMLHttpRequest(); xhr.open(..., false)`) to fetch `settings.json` at startup
- If `comingSoon: false` → gate bypassed for **everyone on every device**, no cookie needed
- If `comingSoon: true` → existing cookie/preview-URL logic applies (team preview via `?preview=amayaa2026`)
- settings.json is tiny and CDN-cached on GitHub Pages, so the sync XHR adds negligible latency

**Dependency:** The Admin Settings toggle for "Coming Soon" needs to actually save to `settings.json` (requires Task #72 — backend write API). Until then: edit `settings.json` directly and commit to toggle it.

**Files to change:**
- `data/settings.json` — add `siteControls.comingSoon: true`
- `gate.js` — add sync XHR check before cookie logic
- `amayaa_admin/amayaa_settings.html` — verify toggle is wired to the right JSON key

---

### PLAN-C · Typography Admin — Proper Tab Separation (Admin vs Public Site)

**Problem:** The "Admin Panel" and "Public Website" tabs in `amayaa_admin/amayaa_typography.html` both show the same controls. `switchScope()` only swaps the active button style — it shows/hides nothing. All current controls affect admin panel appearance only (sidebar colours, nav link sizes, etc.).

**Agreed solution:**
1. Wrap all existing controls in `<div data-scope="admin">` — these stay as-is (Admin panel styles)
2. Build a new `<div data-scope="website" style="display:none">` section with **public site** typography controls:
   - Heading font size (Cormorant Garamond — h1, h2, section titles)
   - Body font size (Jost — paragraphs, cards)
   - Public colour palette (brand orange #C4622D, text #1A0A04, muted #9A8070, etc.)
   - Hero font sizing
   - Product card label sizes
3. Update `switchScope()` to toggle `display` on the two scope divs
4. Extend `typography.json` with a `publicSite` object alongside the existing admin keys
5. Public pages would fetch `typography.json › publicSite` and apply as CSS variables

**Files to change:**
- `amayaa_admin/amayaa_typography.html` — split into two scoped panels, fix switchScope()
- `data/typography.json` — add `publicSite: { headingSize, bodySize, colours: {...} }`
- Public pages — add a small script to fetch and apply `publicSite` CSS vars

---

## REVISION 4 — Sarees Filter Redesign & Post-v2.6 Fixes (August 2026)
**Status:** Complete — ready to tag v2.7  
**Affects:** `amayaa_sarees.html` (primary), `public.css`, `amayaa_blog.html`, `amayaa_about.html`, `amayaa_contact.html`, `amayaa_offers.html`, `amayaa_search.html`

### R4-1 · Sarees Page — Desktop Filter Overlay (feat: desktop sarees filter overlay + 4-col grid)

**Previous:** Static left sidebar filter box always visible; product grid 3 columns.

**New desktop behaviour:**
- Static sidebar removed (`.sidebar-filters{display:none !important}` via `@media(min-width:769px)`)
- Cat layout forced to single column (`.cat-layout{grid-template-columns:1fr !important}`)
- New toolbar row (`.desk-toolbar`) sits above the product grid:
  - **Left:** "Filters" pill button (`.desk-flt-btn`) with funnel SVG icon, glassmorphic style, toggle behaviour
  - **Centre:** Result count span (`.res-count`)
  - **Right:** Sort dropdown (`.sort-sel`)
- Clicking Filters button toggles `.desk-flt-overlay` — a non-modal horizontal overlay panel that slides open below the toolbar (click-outside and × to dismiss)
- Overlay has 6 filter sections: Weave/Region · Fabric · Occasion · Colour · Price (₹) · Show Only
- Product grid changed from `pg3` (3-col) to `pg4` (4-col)

**CSS classes added:** `.desk-toolbar`, `.desk-flt-btn`, `.desk-flt-overlay`, `.desk-flt-inner`, `.desk-flt-section`, `.desk-flt-stitle`, `.desk-flt-chips`, `.desk-flt-chip`, `.desk-flt-close`, `.desk-pr-row`, `.desk-pr-box`

**JS added:** `deskFltToggle()` + document click-outside listener

### R4-2 · Sarees Page — Desktop Colour Filter (36-colour 6×6 grid with hover tooltips)

- Colour section inside overlay uses a 6×6 grid (`.desk-sw-row`) of 36 `.desk-sw` circular swatches
- All 36 common saree colours from Red → White (full list in HTML)
- CSS tooltip via `::after` pseudo-element (`content:attr(title)`) — shows colour name on hover
- Active swatch: `outline-color:#C4622D;transform:scale(1.2)` via `.sel` class

### R4-3 · Sarees Page — Mobile Filter (FAB drawer, colour expand, toggle close)

- Mobile: `.desk-flt-btn` and `.desk-flt-overlay` hidden (`display:none !important`)
- FAB (filter floating action button) now **toggles** — tap opens, tap again closes (`mobFltToggle()`)
- Mobile colour section shows **1 row (6 swatches) by default**; "+ 30 more colours" expands to all 36 in 6×6 grid (`mobSwToggle()`)
- Filter group headers: all static inline `<span>&#8722;</span>` removed from HTML; JS handles +/− indicators exclusively
- Sort toolbar on mobile: `justify-content:flex-start` so count and sort-sel are left-aligned (not spread)

**CSS classes added:** `.mob-sw-grid`, `.mob-sw-collapsed`, `.mob-sw-more`  
**JS added:** `mobFltToggle()`, `mobSwToggle()`

### R4-4 · Sarees Page — Mobile Sidebar Height & Price Range Fix (August 10 2026)

- **Price range overflow:** `.pr-input` lacked `min-width:0` — number inputs overflowed 300px sidebar. Fixed: `@media(max-width:768px){.pr-input{min-width:0}}`
- **Sidebar hanging:** Desktop base rule `max-height:calc(100vh - 120px)` was not overridden on mobile, causing sidebar to stop short of screen bottom with rounded corner floating in air. Fixed: `@media(max-width:768px){.sidebar-filters{max-height:100vh;border-radius:0 16px 0 0}}`

### R4-5 · Font Size Uplift — Filter UI & Toolbar Elements

All newly added filter UI bumped one level:
- `.sort-sel`: `12px` → `13px`
- `.atag` (both occurrences): `11px` → `12px`
- `.desk-flt-stitle`: `10px` (section label, kept compact)
- `.desk-flt-chip`: `12px`

### R4-6 · Footer — Desktop & Mobile Padding Fix (public.css)

- **Desktop:** `.fi2` padding doubled from `0 43px 0 28px` → `0 86px 0 56px` (left/right elements pulled closer to centre)
- **Mobile:** `.fi2{padding:0}` and `.ft{padding:36px 32px 20px}` — equal 3-column footer, no edge bleed
- Applied globally in `public.css` — affects all 7 pages

### R4-7 · Global Mobile Layout Fixes

| Fix | File(s) affected |
|---|---|
| Remove blog lnav vertical sidebar line on mobile | amayaa_blog.html |
| Fix unclosed `@media` block causing cascade corruption | amayaa_contact.html |
| Offers page heading and stats bar centred on desktop | amayaa_offers.html |
| Search page footer rendering on mobile | amayaa_search.html |
| Remove orphaned `.mob-bname` / `.mob-ham` elements from all pages | All 7 |

### R4-8 · Regression Checklist — v2.7

- [ ] Desktop: Filters pill visible left of toolbar; Sort dropdown on right
- [ ] Desktop: Clicking Filters opens glassmorphic overlay panel below toolbar
- [ ] Desktop: Click outside or × closes overlay
- [ ] Desktop: Colour section shows 6×6 grid of 36 swatches with hover tooltips
- [ ] Desktop: Product grid shows 4 columns
- [ ] Desktop: Static left sidebar is gone
- [ ] Mobile: Filters pill (`.desk-flt-btn`) hidden; existing FAB visible
- [ ] Mobile: Tapping FAB opens filter drawer; tapping FAB again closes it
- [ ] Mobile: Colour row shows 6 swatches; "+ 30 more colours" expands to 36
- [ ] Mobile: Price Min and Max inputs both fit within sidebar (no overflow)
- [ ] Mobile: Sidebar extends flush to bottom of screen (no hanging corner)
- [ ] Mobile: Sort toolbar left-aligned; count and sort-sel not spread to opposite ends
- [ ] All pages: Footer padding consistent desktop and mobile
- [ ] Blog: No vertical sidebar line on mobile
- [ ] Contact: No CSS cascade corruption from unclosed @media
- [ ] Offers: Heading centred on desktop

---

## REVISION 6 — FAQ, Policies, Preview Gate, Logo Link (August 11 2026)
**Status:** Complete — ready to tag v2.9  
**Affects:** `amayaa_faq.html` (new), `amayaa_policies.html` (new), `nav.js`, `gate.js` (new), `coming_soon.html` (new), all public HTML pages

### R6-1 · New Pages — amayaa_policies.html & amayaa_faq.html

**amayaa_policies.html** — 5-section policy document, standalone (no nav/footer):
- Sections: Shipping & Delivery · Cancellation & Refund · Terms & Conditions · Privacy Policy · Disclaimer
- Sticky left sidebar with scroll-spy — sidebar link highlights as user scrolls
- Layout: `grid-template-columns: 220px 1fr`; collapses to single column on mobile
- Glassmorphic section cards with terracotta accent colour
- **No nav.js / no header / no footer** — fully standalone read-only page
- **No WhatsApp float button** — browser Back button is the only navigation
- `gate.js` loaded in `<head>` — page is gated like all other public pages

**amayaa_faq.html** — 22 accordion questions, standalone (no nav/footer):
- 6 categories: Ordering · Shipping · Returns · About Sarees · Care & Maintenance · Payment
- Live keyword search (`faqSearch()`): filters `.faq-item` elements in real time
- Category filter chips (`filterCat()`): show/hide `.faq-group` sections
- Accordion toggle (`toggleFaq()`): `max-height` CSS transition, one-open enforced
- No-results message with WhatsApp fallback link
- **No nav.js / no header / no footer** — browser Back is only navigation
- `gate.js` loaded in `<head>`

**Admin-configurability noted** (Task #75): Both pages will be wired to `data/faq.json` and `data/policies.json` in a future revision with Admin CRUD.

### R6-2 · nav.js — Footer Updated (Discover + Connect columns)

**Discover column** (unchanged + addition):
- Our Story, Blog, Care Guide — existing
- **Policies & T&C** → `amayaa_policies.html` — new link added

**Connect column** (restructured):
- **Removed:** WhatsApp link, Email Us link
- **Moved up:** Visit Store
- **Added:** FAQ → `amayaa_faq.html`
- Final order: Contact Us · Visit Store · FAQ

All 9+ pages pick up the footer change automatically via `nav.js` injection.

### R6-3 · nav.js — Logo Clicks Go Home

The `<div class="nav-seal">` (the circular seal icon in the top-left pill) is now wrapped in:
```html
<a href="index.html" style="display:flex;align-items:center;text-decoration:none;">
  <div class="nav-seal">…</div>
</a>
```
The `<a href="index.html" class="nav-brand">` (text logo, right of seal) was already a link.
Both logo elements now navigate to `index.html` on click — standard UX expectation.

### R6-4 · gate.js — Preview Gate (Cookie-Based Coming Soon)

**File:** `gate.js` (new, ~60 lines, loaded in `<head>` of every public page)

**Behaviour:**
- Visiting any page **without** the preview cookie → immediate redirect to `coming_soon.html`
- Visiting `?preview=amayaa2026` → sets session cookie `amayaa_preview=amayaa2026`, removes query param from URL bar, page loads normally
- Cookie persists for the browser session (no `Expires` = session cookie)
- `coming_soon.html` itself is excluded from the redirect loop

**Implementation notes:**
- Pure JS, no server-side dependency — works on GitHub Pages (static host)
- Cookie set with `SameSite=Lax; path=/` — no cross-site leakage
- `history.replaceState()` cleans the `?preview=...` from the URL bar after cookie is set

### R6-5 · coming_soon.html — Branded Coming Soon Page

**File:** `coming_soon.html` (new, fully standalone — no nav.js, no gate.js)

**Contents:**
- Animated orb background (matches site aesthetic)
- Amayaa logo (falls back to text if `images/amayaa-logo.png` not found)
- Headline: *"Something beautiful is coming."*
- Two-line description of the boutique
- WhatsApp "Notify me" button (pre-filled message: "Hi, I'd like to know when Amayaa launches!")
- Copyright footer
- No navigation, no links to internal pages

### R6-6 · Gate Activation Instructions (for Debabrata)

**To preview the site yourself (any device/browser):**

Open this URL in the browser:
```
https://amayaabypolkadots.in/index.html?preview=amayaa2026
```
The cookie is set instantly. All pages are then accessible for that browser session.
Repeat on each device or browser you want to test with.

**What a regular visitor sees:**
- They type `amayaabypolkadots.in` (or any page URL)
- `gate.js` runs before the page renders, finds no cookie
- Immediately redirected to `coming_soon.html`
- They see the branded "Something beautiful is coming" page with a WhatsApp Notify button

**To go live (remove the gate):**
1. Delete `gate.js` and `coming_soon.html` from the project
2. Remove `<script src="gate.js"></script>` from the `<head>` of every HTML file (search-replace in editor)
3. Commit and push — site is public immediately

---

## REVISION 5 — Data-Driven Sarees Grid, ProductDrawer, Hero Banners (August 11 2026)
**Status:** Complete — tagged v2.8  
**Affects:** `amayaa_sarees.html`, `index.html`, `CHANGELOG.md`, `images/`

### R5-1 · Sarees Page — Data-Driven Product Grid

**Previous:** Hardcoded static product cards in HTML.

**New behaviour:**
- `_boot(_fallback)` fires synchronously on page load — 12 products render instantly on any protocol (file://, localhost, live)
- `fetch('data/products_index.json')` runs in background and upgrades grid silently if successful
- Batch size: 8 cards; "Load More Sarees ↓" button reveals remaining
- Result count: "Showing X of Y sarees"
- Filter engine reads both desktop overlay chips and mobile sidebar checkboxes — OR within each dimension, AND across dimensions
- Sort: Low to High, High to Low, A to Z, Newest First
- All cards open `ProductDrawer.open(id)` on click — no inline WhatsApp links

**Bug fixed:** 3 desktop chips and 3 mobile checkboxes were hardcoded as pre-selected in HTML (leftover demo states), causing "Showing 1 of 1 sarees" on load. Fixed by removing `class="desk-flt-chip on"` and `checked` attributes.

**Bug fixed:** Corrupted junk block and obsolete `nameToId` script removed from file tail — were causing `SyntaxError: Unexpected token '.'` breaking all JS on the page.

### R5-2 · index.html — ProductDrawer Wired to New Arrivals

- `product-drawer.css` and `product-drawer.js` added to `<head>`/`<body>`
- All 4 New Arrivals `.pc` cards wired: `onclick="ProductDrawer.open('AMY-xxx')"`
- Inline WhatsApp enquire links removed from product cards

### R5-3 · index.html — Hero Banner with Real Images (6 slides, 24s cycle)

**Previous:** 5 slides with CSS gradient backgrounds only.

**New:** 6 slides with real saree images, 4s each:

| Slide | Image | Copy |
|---|---|---|
| s1 | `images/Common.jpg` | New Arrivals — Where Every Thread Tells a Story |
| s2 | `images/Kanjivaran Gem.png` | South India Exclusive — Kanjivaram, The Queen of Silks |
| s3 | `images/Jamdani CG.png` | Bengal Heritage — Jamdani, The Art of Bengal |
| s4 | `images/Paithani NBG 1.jpg` | Maharashtra Royal Weave — Paithani, Woven in Gold & Peacock |
| s5 | `images/Pochampally CG.png` | Telangana Collection — Pochampally Ikat, Geometry in Silk |
| s6 | `images/Banarsi CG.png` | Varanasi Collection — Banarasi, The Silk of Emperors |

**CSS experiments (marked, revertable):**
- `EXPERIMENT-A`: `object-position: center 15%` — shifts crop down to clear nav pill from model faces. Revert to `center top` if needed.
- `EXPERIMENT-B`: Text bottom-aligned, transparent background, white text + drop shadow. Remove marked block to revert.

**Case-sensitivity fix:** `images/` tracked lowercase in git; HTML had `Images/` (uppercase). GitHub Pages (Linux) is case-sensitive — images were missing on live site. Fixed `src="Images/..."` → `src="images/..."` across all slide `<img>` tags.

### R5-4 · Changelog Policy

`CHANGELOG.md` is the single source of truth. Updated at every meaningful commit. No duplication in other docs.

---

## REVISION 3 — Agreed Changes (August 2026)

---

## REVISION 2 — Agreed Changes (August 7 2026)

### R2-1 · Search Overlay — Behaviour on ALL pages (Issues 1 & 2)

**Previous spec (SUPERSEDED):** Search icon in pillbar navigated directly to `amayaa_search.html`.

**New agreed behaviour:**
- Clicking the pillbar search icon on **any page** (index, about, blog, sarees, AND amayaa_search.html) opens the search overlay **in-place on the current page**.
- The current page stays visible in the background but goes **hazy and blurred** (`backdrop-filter: blur(4px)` + semi-transparent dark overlay).
- The search overlay panel occupies **60% of the screen width, centered** horizontally.
- After the user submits a search query:
  - If on `amayaa_search.html` → calls `window._amayaaUpdateQuery(query)` to update results inline (no navigation).
  - If on any other page → navigates to `amayaa_search.html?q=<query>`.
- ESC key also closes the overlay.
- Overlay is injected by `nav.js` and styled in `public.css` (no page-level CSS needed).

### R2-2 · Search Overlay — Layout / Design (Issue 2)

The search overlay panel must match the PDF mockup for element placement:
- **Header:** Amayaa logo at **top-left**, × close button at **top-right**.
- **Body:** A prominent, centered search input field with a submit button.
- **Width:** 60% of viewport, centered, with visible rounded corners and a subtle shadow.
- **Background of panel:** White or very soft cream — clean, not gradient-heavy.
- Quick-filter chips below the input (Banarasi, Kanjivaram, Wedding, New Arrivals) are retained.

### R2-3 · Search Results Page — Layout Fixes (Issues 4 & 5)

**Hero band (Issue 5 — CHANGED):**
- The full-width plum→terracotta gradient "Search Results" hero band is **removed**.
- Replaced with a compact, simple page-title row: one-line heading ("Search Results" or the query), active filter pills, and result count — all on a plain cream or white background, no bold gradient band.

**CSS conflicts (Issue 4 — FIXED):**
- The `* { margin: 0; padding: 0; box-sizing: border-box; }` reset block inside `amayaa_search.html`'s `<style>` tag is **removed**.
- All CSS that overlaps with `public.css` (nav pill, footer, orbs, typography) is removed from the page-level `<style>` block.
- `amayaa_search.html` must load `public.css` and rely on it exclusively for nav/footer/shared styles — exactly like every other page.
- Only genuinely page-specific rules (search grid, result cards, filter toolbar) remain in the `<style>` block.

### R2-4 · Product Overlay — Dimensions & Structure (Issue 6)

**Previous spec (SUPERSEDED):** 75% width side drawer, `.pd-header` full-width gradient, photo section above details.

**New agreed layout:**

| | |
|---|---|
| **Width** | 75% of viewport, slides in from the **right** |
| **Height** | 100% viewport height |
| **Background behind drawer** | Hazy blurred page (`backdrop-filter: blur(4px)` + dark semi-transparent overlay) |
| **Drawer body background** | Soft lavender-to-cream gradient (unchanged from original spec) |

**Header of the overlay (full 70% width):**
- Breadcrumb at **left** (e.g. "Search results › Product detail")
- Amayaa logo at **top-right corner** of the header
- × close button immediately beside the logo (top-right)
- Header background: muted/mellow tone — **NOT** the plum→terracotta gradient (see R2-5)

**Body — 3-column layout within the 70% overlay:**

| Column | Width | Content |
|---|---|---|
| Left | ~40% | Main image viewer |
| Centre | ~15% | Thumbnail strip |
| Right | ~40% | Product details |

**Left column — Main image viewer:**
- Displays one full-size product image at a time.
- **Auto-scrolls** to the next image every **4 seconds**.
- **Left / right arrow sliders** for manual navigation (‹ ›).
- Image counter "1 / 4" shown bottom-right of the image.
- When `photos: []` (empty) → shows a **gradient colour swatch** generated from `gradientFrom` / `gradientTo` fields of the product.

**Centre column — Thumbnail strip (vertical, ~15% width):**
- Shows **3 smaller thumbnails** (images 2, 3, 4 — image 1 is already in the main viewer).
- When `photos: []` → shows **4 different gradient colour variation swatches** as thumbnails (colour swatches, not "photo coming soon" text). Each swatch uses a distinct gradient derived from the product's colour palette.
- Clicking any thumbnail immediately loads it into the main image viewer.
- The active thumbnail is highlighted with a border or overlay.

**Right column — Product details (~40% width, independently scrollable):**
- Product name (Cormorant Garamond)
- Price (terracotta), strike-through original if on offer, savings badge
- Badge chips: New / GI Tagged / On Offer
- Type · Region · SKU (muted small text)
- Specs strip: Fabric · Weave · Length · Blouse · Occasion · Colour
- Short description (always visible, not in accordion)
- Expandable accordion: **Weave Story** (collapsed by default)
- Expandable accordion: **Care Instructions** (collapsed by default)

**Footer of overlay (fixed, always visible at bottom):**
- "Enquire on WhatsApp" — full-width green CTA
- "Call Us — +91 95839 46000" — full-width white bordered button
- Tertiary row: "Save to wishlist" (heart) + Share icon
- Wishlist: stores `amayaa_wishlist` in localStorage
- Share: copies `?id=AMY-xxx` URL to clipboard, brief "Link copied" toast

### R2-5 · Product Overlay — Header Colors (Issue 3)

**Previous:** `.pd-header` used `linear-gradient(135deg, #8B1A4A, #C4622D)` — too loud / visually dominant.

**New:** Header uses a **muted, mellow palette** consistent with the site's lavender-cream theme:
- Background: soft warm ivory `#FBF5ED` (same cream as filter toolbar)
- Bottom border accent: 2px solid `#c8b8d8` (soft lavender — matches drawer border-left)
- Text on header: deep plum `#5A1830` for breadcrumb, terracotta `#C4622D` for product name
- Amayaa logo (top-right): uses its natural colours (no forced tinting)
- × close button: plum `#8B1A4A` on hover, grey at rest

### R2-7 · Product Overlay — Exact Column Layout (per "Product Overlay Alignment.png")

The alignment diagram uploaded to project storage confirms the following stacking (drawer = 75% of screen):

**Structure (top to bottom, left to right):**

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (full 70% width): breadcrumb left · logo+X right   │
├─────────────────┬──────────────┬────────────────────────────┤
│                 │  Thumbnail 1 │                            │
│                 │  (gradient   │   Product details          │
│  Column 1       │   swatch)    │   (scrollable):            │
│  Image Viewer   ├──────────────┤   name, price, specs,      │
│  (full height   │  Thumbnail 2 │   description,             │
│  from header    │  (gradient   │   weave story accordion,   │
│  to bottom)     │   swatch)    │   care accordion           │
│                 ├──────────────┤                            │
│  Arrows float   │  Thumbnail 3 │                            │
│  over image     │  (gradient   ├────────────────────────────┤
│  L/R centred    │   swatch)    │  WhatsApp CTA (green)      │
│                 │              ├────────────────────────────┤
│                 │              │  Call us (bordered)        │
│                 │              ├───────────────┬────────────┤
│                 │              │  Wishlist     │   Share    │
└─────────────────┴──────────────┴───────────────┴────────────┘
```

**Key rules from the diagram:**
- Column 1 (image viewer) spans the FULL height from below the header to the very bottom of the drawer. It has NO CTA, no footer, no bottom strip.
- Columns 2+3 share a bottom CTA section: WhatsApp row (full width of cols 2+3), Call row (full width of cols 2+3), then WishList (col 2 half) + Share (col 3 half) side by side.
- The product detail column 3 scrolls independently above the fixed CTA section.
- Column 2 shows only 3 thumbnails (not 4) because the image currently in the main viewer is not shown in the thumbnail strip; it rotates out.

### R2-8 · Gradient Colors for Empty State (when photos: [] )

**Main image viewer background** (column 1):
- `linear-gradient(160deg, #EAE0F5, #F5EEF8)` — soft lavender-to-blush

**Thumbnail swatches** — 4 gradient variations derived from the product's colour palette:
- Swatch 1 (warm gold): `linear-gradient(135deg, #E8C87A, #C49A32)`
- Swatch 2 (rose pink): `linear-gradient(135deg, #F0C0CC, #D4607A)`
- Swatch 3 (indigo blue): `linear-gradient(135deg, #98A8D0, #3A4E8C)`
- Swatch 4 (deep plum — shown in main viewer by default): `linear-gradient(135deg, #C490B8, #7A2050)`

Rotating rule: whichever swatch is currently displayed in the main viewer is ABSENT from the thumbnail strip. The 3 remaining swatches are shown as thumbnails. Clicking a thumbnail moves it to the main viewer and the previous main-viewer swatch takes its place in the strip.

When real `photos[]` exist (future): same rotation logic applies — the currently displayed photo is not repeated in the thumbnail strip.

### R2-6 · Regression / Testing — What to verify after implementation

All items below must pass before handover:

1. **Search icon** on index.html, about.html, amayaa_blog.html, amayaa_sarees.html, amayaa_search.html — all open the search overlay in-place (not navigate away).
2. **Search overlay** appears at 60% width, centred, with hazy background on the page behind it.
3. **Search submit** from non-search pages navigates to `amayaa_search.html?q=...`; from search page updates results inline.
4. **ESC key** closes search overlay.
5. **Search results page** nav pill bar and footer render identically to index.html (no distortion).
6. **Search results page** has no full-width gradient hero band — only a compact title row.
7. **Product overlay** slides in from right at 70% width.
8. **Product overlay header** is cream/ivory with no loud gradient.
9. **Amayaa logo** visible in top-right of overlay header.
10. **3-column body layout** renders correctly: image viewer left, thumbnail strip centre, details right.
11. **Main image auto-scrolls** every 4 seconds; left/right arrows work.
12. **Thumbnail click** loads that image into main viewer; active thumbnail highlighted.
13. **Gradient swatches** (4 variations) shown when `photos: []`.
14. **Accordions** (Weave Story, Care Instructions) expand/collapse correctly.
15. **WhatsApp CTA** link opens correct URL with product name and ID.
16. **Wishlist heart** toggles and persists in localStorage.
17. **Share** copies correct `?id=` URL to clipboard.
18. **ESC / × / backdrop click** all close drawer and remove `?id=` from URL.
19. **Deep-link** — loading `amayaa_search.html?id=AMY-BAN-001` auto-opens the drawer.
20. **Mobile** — overlay goes full-screen (100vw/vh); thumbnail strip may stack below main image.

---

---

## 1. Search Results Page — amayaa_search.html

### What it is
A dedicated search results page. Not a reuse of amayaa_sarees.html. Accessed when user submits a search from the nav overlay.

### URL structure
```
amayaa_search.html?q=red&type=banarasi&occasion=wedding&price=5000-15000&new=1&gi=1
```
Parameters are the same as the search overlay filter set (see §3 below).

### Page structure (top to bottom)
1. **Nav bar** — injected by nav.js (same as all public pages)
2. **Hero band** — plum→terracotta gradient, shows: "Search results" eyebrow label, search query in Cormorant Garamond italic, active filter pills (each removable with ×, plus "Clear all")
3. **Filter toolbar** — cream (#FBF5ED) strip with:
   - Result count: "**7 sarees** found"
   - Dropdown pills: Weave ▾ · Colour ▾ · Fabric ▾ · Occasion ▾ · Price ▾ (each opens a small dropdown panel)
   - Toggle pills: GI tagged · New · On offer (tap to add/remove from filter)
   - Sort: "Sort: Relevance ▾" dropdown (right-aligned)
4. **Product grid** — 4-column desktop, 2-column mobile; cards identical to sarees page style
5. **Infinite scroll** — on scroll near bottom, next batch of 12 loads silently; "Showing 12 of 31 sarees" text at bottom of grid (not a button)
6. **Footer** — injected by footer.js (same as all public pages)

### Product cards
- Same card design as amayaa_sarees.html (gradient, name, type, region, price, badges)
- Wishlist heart icon (top-right of card image)
- Click anywhere on card → opens Product Drawer overlay (ProductDrawer.open(id))
- No direct link to amayaa_product.html from search results page

### Infinite scroll behaviour
- Page load: fetch products_index.json, apply URL params as filters, render first 12 results
- On scroll to within 200px of bottom: load next 12 (client-side slice, already in memory)
- "Showing X of Y sarees" updated after each batch
- When all results shown: text changes to "Showing all Y sarees"
- If 0 results: show "No sarees match your search" with "Broaden search" link that reopens filter overlay

### localStorage persistence
- Key: `amayaa_search_state` — JSON of last filter state
- Written every time filters change
- Pre-fills filter toolbar and hero pills on next visit to search page
- "Clear all" button clears localStorage too

---

## 2. Product Drawer Overlay — product-drawer.js + product-drawer.css

### Philosophy
Modular, plug-and-play. Any page can open it with one call:
```js
ProductDrawer.open('AMY-BAN-001');
```
Include on any page:
```html
<link rel="stylesheet" href="product-drawer.css">
<script src="product-drawer.js"></script>
```

### Backdrop (behind the drawer)
- `backdrop-filter: blur(4px)` on the page content
- Semi-transparent dark overlay: `rgba(26, 10, 4, 0.38)` — hazy, not solid black
- Page content is visible but dimmed and blurred — not greyed out or desaturated

### Drawer dimensions
- Desktop: 75% viewport width, full viewport height, slides in from right
- Mobile: 100% viewport width and height (full screen)
- Drawer body: independently scrollable; page behind is scroll-locked while drawer is open

### Drawer background
- Lavender-to-cream gradient: `linear-gradient(160deg, #EAE0F5 0%, #F5EEF8 30%, #FBF5ED 70%, #FDF8F2 100%)`
- Border-left: 1px solid #c8b8d8 (soft lavender border)
- Matches the footer lavender palette of the site

### Drawer header
- Same gradient as hero bands: `linear-gradient(135deg, #8B1A4A, #C4622D)`
- Shows: breadcrumb (e.g. "Search results › Product detail" or "Sarees › Product detail" — auto-detected from referrer page), product name in Cormorant Garamond, × close button

### Drawer content (scrollable, top to bottom)

#### Photos
- Main photo: 220px height, left/right arrow navigation (‹ ›), photo counter "1 / 4" bottom-right
- Thumbnail row: up to 4 thumbs below main photo; tap to switch main photo
- Badges (New / GI Tagged / On Offer) overlaid on photo top-left

#### Product meta
- Type · Region · SKU (small muted text)
- Price in Cormorant Garamond terracotta, original price struck-through if on offer, savings badge in navy

#### Specs strip (2-row, 3-column grid)
- Fabric · Weave type · Length
- Blouse piece · Occasion · Colour

#### Short description
- Plain text, 2–3 lines, always visible (not in accordion)

#### Accordions (collapsed by default, tap to expand)
1. Weave story — includes heritage facts strip (Days to weave, Generation weaver, Years of tradition, GI status)
2. Care instructions

#### "More content below" indicator
- Animated bouncing chevron-down arrow (terracotta) near bottom of initial viewport
- Disappears once user has scrolled past initial fold

### Drawer footer (fixed, always visible)
- **Primary CTA:** "Enquire on WhatsApp" — full width, green gradient (#1A8A3A → #22A847), WhatsApp SVG icon. Link: `wa.me/919583946000?text=Hello! I am interested in [product name] ([product ID])`
- **Secondary CTA:** "Call Us — +91 95839 46000" — full width, white bordered button, phone SVG icon. Link: `tel:+919583946000`
- **Tertiary row:** "Save to wishlist" (heart icon, flex-1) + Share (icon button)
  - Wishlist: toggles heart fill, stores `amayaa_wishlist` array in localStorage
  - Share: copies `?id=AMY-xxx` URL to clipboard, shows brief "Link copied" toast

### Closing the drawer
- × button in header
- ESC key
- Click the backdrop
- All three restore scroll-lock and remove `?id=` from URL

### URL / deep-linking
- On open: `history.pushState` adds `?id=AMY-BAN-001` to URL (without page reload)
- On close: `history.pushState` removes the `?id=` param
- On page load: if `?id=` param is present in URL, auto-open the drawer for that product (enables shared links)

### Breadcrumb auto-detection
- If opened from amayaa_search.html → "Search results › Product detail"
- If opened from amayaa_sarees.html → "Sarees › Product detail"
- If opened from index.html → "Home › Product detail"
- Default: "Amayaa › Product detail"

### Data source
- Fetches `data/products/[ID].json` on open (not products_index.json — the full 29-field file)
- Shows brief skeleton loader while fetching
- On fetch error: shows "Product not found" state with "Back to search" link

---

## 3. Filter / Search Parameters

| URL param | Control type | Values | Maps to |
|---|---|---|---|
| `q` | Text (from overlay) | Any string | Matches name, type, region, shortDescription, tags |
| `type` | Dropdown multi-select | banarasi,kanjivaram,… | product.type (case-insensitive) |
| `colour` | Dropdown multi-select | red,gold,… | product.tags array |
| `fabric` | Dropdown multi-select | silk,cotton,… | product.fabric |
| `occasion` | Dropdown multi-select | wedding,festive,… | product.occasion array |
| `price` | Dropdown range | 0-5000, 5000-15000, etc. | product.price |
| `new` | Toggle pill | 1 | product.badges includes "new" |
| `gi` | Toggle pill | 1 | product.giTagged === true (from detail JSON) / tags includes "gi" |
| `offer` | Toggle pill | 1 | product.badges includes "offer" |

Filter logic: within a parameter, values are OR. Across parameters, logic is AND.  
Example: type=banarasi,kanjivaram & occasion=wedding → Banarasi OR Kanjivaram sarees that are also for weddings.

---

## 4. nav.js Update

Search icon in nav currently opens an inline overlay on the same page. Update:
- Search icon click → navigate to `amayaa_search.html` (if not already on it)
- If already on `amayaa_search.html` → re-open the filter panel inline
- Last search state is restored from localStorage on page load

---

## 5. Files Affected

| File | Change |
|---|---|
| `product-drawer.js` | NEW — modular drawer component |
| `product-drawer.css` | NEW — all drawer styles |
| `amayaa_search.html` | NEW — search results page |
| `nav.js` | UPDATE — search icon navigates to amayaa_search.html |
| `testing/tests/regression.spec.js` | UPDATE — add search page and drawer tests |
| `test_and_deploy.sh` | UPDATE — add amayaa_search.html to 306-check list |

---

## 6. Architecture Rules for Drawer

1. Never hardcode drawer HTML in a page. Always include product-drawer.js via `<script src>`.
2. Never duplicate drawer CSS in page-specific styles. All drawer styles live in product-drawer.css.
3. ProductDrawer.open(id) is the only public API. No direct DOM manipulation from calling pages.
4. The drawer must work correctly if the `?id=` URL param is present on page load (deep-link case).
5. Scroll lock (`document.body.style.overflow = 'hidden'`) must be released on every close path (ESC, ×, backdrop).
6. On mobile, the drawer takes full screen — no backdrop visible.

---

## REVISION 3 — Agreed Changes (August 2026)

### R3-1 · Product Overlay — Complete Layout Redesign

**Previous spec (R2, SUPERSEDED):** 75vw, 3-column (image 41% | thumbs 28% | details), thumbs in vertical strip, CTA spanning cols 2+3.

**New agreed layout:**

| Zone | Col 1 (50%) | Col 2 (50%) |
|---|---|---|
| Header (full width, ~72px) | Deep purple gradient — spans both columns | ← same |
| Body top (~65% of remaining height) | Main image viewer | Scrollable product details |
| Body bottom (~90px fixed strip) | 4 gradient swatches side-by-side (25% each of col1) | CTA panel (WhatsApp + Call + WishList/Share) |

**Width:** 60vw (reduced from 75vw)

**Header:**
- Background: `linear-gradient(135deg, #7B5EA7, #9B7DC4)` — deep/mid purple
- Height: ~72px (taller than before)
- Left: breadcrumb text in white, larger font (~15px)
- Right: Amayaa logo text + × button, both white
- Bottom border: removed pale yellow; use `2px solid rgba(255,255,255,0.2)` or deep purple shade

**Image viewer (col1 top):**
- Padding: 15px from top, 10px from left/right sides — maximum image space
- Floating L/R arrows centered vertically over image
- 4-second auto-scroll
- Object-fit: cover, fills available space

**Swatch strip (col1 bottom, ~90px high):**
- 4 gradient swatches always visible, side by side, each 25% of col1 width
- Active swatch (= currently shown in main viewer) is **highlighted** with a white border + glow
- Clicking a swatch loads it into the main viewer and updates highlight
- Swatches: Deep Plum, Warm Gold, Rose Pink, Indigo Blue
- When real photos exist: same strip shows photo thumbnails

**Product details (col2 top, independently scrollable):**
- All font sizes increased (name: 22px, price: 26px, type line: 13px, specs: 14px, accordion labels: 15px)
- Specs layout: **single column** stack (label + value stacked, not 2-col grid)
- Short description, Weave Story accordion, Care Instructions accordion

**CTA panel (col2 bottom, fixed height matching swatch strip):**
- WhatsApp button (full col2 width, green)
- Call button (full col2 width, bordered)
- WishList (50%) + Share (50%) row

### R3-2 · Search Page (amayaa_search.html) — Nav/Footer Fix

**Problem:** Page used nav.js injection (`<div id="nav-wrap">`) which relied on public.css for nav styling. No other page uses this approach — all other pages have nav HTML inline with their own nav CSS block. The injected nav was missing sticky positioning, mobile panel styles, and other CSS, causing broken layout.

**Fix:** Completely rewrite amayaa_search.html. Copy nav HTML + nav CSS block verbatim from amayaa_sarees.html. Copy footer HTML verbatim. Keep all search-specific JS and grid content.

### R3-3 · Search Overlay — Fix on index, blog, about, sarees pages

**Problem:** nav.js has an early return (`if (!_wrap) return`) when no `div#nav-wrap` exists. This means on other pages (which use inline nav), nav.js does nothing — the new search overlay and `_amayaaNavSearch` function are never created. Each page had its own OLD inline search overlay (using old CSS, pointing to sarees page, not search page).

**Fix:**
- Restructure nav.js: srchOverlay injection and `_amayaaNavSearch` registration run ALWAYS, regardless of whether `#nav-wrap` exists
- Nav HTML injection still only happens when `#nav-wrap` is found
- Remove old inline `srchOverlay` div from index.html, amayaa_sarees.html, amayaa_blog.html, amayaa_about.html
- Add `<script src="nav.js"></script>` to each of those pages

### R3-4 · Regression Checklist — What to verify after R3

1. Search icon on index, about, blog, sarees opens NEW overlay (60% panel, logo left, × right)
2. Submitting search navigates to amayaa_search.html?q=...
3. amayaa_search.html nav pill is sticky and renders identically to other pages
4. amayaa_search.html footer renders correctly with logo
5. Product overlay opens at 60vw with deep purple header
6. Logo visible in header top-right (white text)
7. Breadcrumb visible and larger font
8. Image viewer fills col1 top with minimal padding (15px top, 10px sides)
9. 4 swatches in col1 bottom strip — active highlighted with border
10. Clicking swatch swaps main viewer image and moves highlight
11. Col2 top scrolls independently
12. All text larger than R2 (name, price, specs)
13. Specs single-column (not grid)
14. CTA panel in col2 bottom: WhatsApp, Call, WishList+Share
15. Mobile: drawer full-screen, swatches stack or wrap

---

## VERSION 3.2 — Content Library + Product Wiring (Aug 15 2026)

### v3.2-1 · Content Library System

**New file:** `data/content_library.json`

Schema:
```json
{
  "weaveStories":    [ { "id": "WS-001",   "name": "...", "text": "..." } ],
  "careSuggestions": [ { "id": "CI-001",   "name": "...", "text": "..." } ],
  "descriptions":    [ { "id": "DESC-001", "name": "...", "text": "..." } ],
  "contentBundles":  [ { "id": "CB-001", "name": "...", "weaveStoryId": "WS-001", "careSuggestionId": "CI-001", "descriptionId": "DESC-001" } ]
}
```

Resolution order in product drawer: individual IDs override bundle. `_resolveContent(p)` in `product-drawer.js` handles: weaveStoryId → careSuggestionId → descriptionId; if any missing, falls back to the product's contentBundleId bundle entry.

Uniqueness constraint: saving a bundle with the same WS + CS + Desc combo as an existing bundle is blocked with an error.

### v3.2-2 · Content Library Admin Page

**New file:** `amayaa_admin/amayaa_content_library.html`

3-box layout:
- **Box 1:** type dropdown (Weave Story / Care Suggestions / Description)
- **Box 2:** scrollable entry list — click to select; `+ New` creates a blank entry
- **Box 3:** detail panel — read-only ID badge (auto-assigned WS-NNN etc.), Name input, Text textarea; locked until Edit clicked; Save writes via `_ghSave()` to `data/content_library.json`
- **Bottom section:** Content Bundles — own list + edit panel; bundle has ID (CB-NNN), Name, and 3 dropdowns (WS, CS, Desc); duplicate combo blocked at save

Added to `sidebar.js` under Content group: `{h:'amayaa_content_library.html', i:'📚', l:'Content Library'}`

### v3.2-3 · Product Edit Page — Content Section Rewrite

**File:** `amayaa_admin/amayaa_product_edit.html`

Replaced old Descriptions card with a Content section containing:
- Content Bundle dropdown (`#contentBundleId`) — optional; selecting one auto-fills individual dropdowns if they are empty (`onBundleChange()`)
- Description dropdown (`#descriptionId`)
- Weave Story dropdown (`#weaveStoryId`)
- Care Suggestions dropdown (`#careSuggestionId`)

JS added: `_loadContentLibrary()`, `_populateContentSelects()`, `onBundleChange()`, `onIndividualContentChange()`, `_updateDescPreview()`. Content library loaded on DOMContentLoaded before product data.

### v3.2-4 · Product Drawer — Content Resolution + QR Code

**File:** `product-drawer.js`

- `_resolveId(category, id)` — looks up entry by ID in the loaded library
- `_resolveContent(p)` — resolves individual IDs first, falls back to contentBundleId bundle
- QR code section: "Share This Saree" with `#pd-qr-container`; lazy-loads qrcodejs from cdnjs; 140×140px; colours `#1A0A04` / `#FAF6F2`; links to `amayaabypolkadots.in/amayaa_sarees.html?id=`
- Section header renamed to "Care Suggestions" (not "Care Guide") to avoid legal implications

### v3.2-5 · Product Manager — Quick-View Panel

**File:** `amayaa_admin/amayaa_products.html`

- Fixed `products_index.json` → `products.json` (all references)
- Quick-view panel: 480px slide-in from right; shows full product detail — image, name, price, badges, specs, weave story, care suggestions, description (all resolved from content library), QR code
- Table row `onclick="_openQV(id)"` with `event.stopPropagation()` on checkbox cell and actions cell so Edit/Delete/checkbox don't trigger QV
- `_loadLibrary()` fetches `data/content_library.json` on DOMContentLoaded; `_resolveContent(p)` resolves IDs before rendering QV

### v3.2-6 · Offers Page — Product Drawer Fix

**File:** `amayaa_offers.html`

- Added `<link rel="stylesheet" href="product-drawer.css">` in `<head>`
- Added `<script src="product-drawer.js"></script>` before closing `</body>`
- Root cause: card `onclick="ProductDrawer.open(id)"` was wired but the script/CSS were never loaded, so clicks silently failed

### v3.2 Regression Checklist

1. Clicking any saree card on `amayaa_offers.html` opens product drawer correctly
2. Product drawer shows resolved description, weave story, care suggestions from content library
3. QR code renders in product drawer footer
4. Admin Content Library page: create/edit/delete entries + bundles; saves persist to GitHub
5. Admin Product Edit: Content Bundle dropdown auto-fills individual dropdowns; save includes all IDs
6. Admin Product Manager: clicking a row opens quick-view panel; Edit/Delete/checkbox do NOT trigger QV
7. Content resolution: individual ID takes precedence over bundle fallback

### Pending (not in v3.2)

- #68: GoatCounter analytics audit
- #69: ImageKit.io image CDN integration
- #71: Formspree contact form verification
- #73: Regression script update for Phase 3 pages
- #74: Comprehensive functional testing
- #77: Custom domain email setup
- #135: `git push origin main` from Mac Terminal (commits are local — see below)

**Push command:**
```bash
cd ~/Downloads/Amayaa_site && rm -f .git/index.lock .git/HEAD.lock && git push origin main
```

---

## v3.4 · Aug 17 2026 — Content, Typography & Blog

### v3.4-1 · Hero Fold Bar Restructure
**File:** `index.html`
- Trust strip (6-item scrolling bar) moved out of the hero section into a dedicated 15vh gap below the hero
- Fold bar `.hfb-explore` Explore button centered with `flex:1` on `.hfb-group` (horizontal) and `bottom:calc(7.5vh - 32px)` on `.scroll-hint` (vertical 32px correction)
- Standalone `#pageExploreIndex` Explore button now tracks same pixel position across all content sections
- Trust strip: "Handpicked Traditional Weavers" swapped to left group first; "500+ Authentic Sarees" to right group last
- Decorative dots (`.pdots`) removed from Collections and New Arrivals sections
- `.sec-lbl` font increased 11px → 12px; `.sec-desc` class added for section subtitles
- All three content sections (Collections, New Arrivals, Blog) now have `<p class="sec-desc">` subtitle lines

### v3.4-2 · Silk Mark Certification Sitewide
**Files:** `index.html`, `amayaa_sarees.html`, `amayaa_offers.html`, `amayaa_search.html`, `amayaa_about.html`, `product-drawer.js`, all admin pages
- All references to "GI Tagged" / "GI Tag" replaced with "Silk Mark Certified" / "Silk Mark Certification"
- Trust strip updated from "GI Tagged Products" to "Silk Mark Certified"
- Search page toggle filter updated to "Silk Mark Certified"

### v3.4-3 · Blog Post Reader + Admin Editor
**Files:** `amayaa_blog_post.html` (new), `amayaa_blog.html`, `amayaa_admin/amayaa_blog.html`, `data/blog.json`
- `amayaa_blog_post.html` created — full markdown-rendered blog reader page with hero band, article layout, related posts, back button
- `amayaa_blog.html` made fully data-driven — fetches `data/blog.json`, renders cards, links to reader page via `?id=`
- Admin blog editor upgraded with EasyMDE markdown editor + 5 content templates (Weave Type, Weaver Story, Care Guide, Regional Style, Comparison)
- Blog body saved as markdown in `blog.json` under each post's `body` field
- BLG-001 full markdown body added

### v3.4-4 · Our Story Page Enrichment
**Files:** `data/about.json`, `amayaa_about.html`
- 3rd story section added: "Our Promise — Authenticity You Can Trace"
- 4 weaver profiles fully written with community/cooperative details and provenance
- 4 values cards enriched with longer, more specific descriptions
- Blog content BLG-002 through BLG-006 written in full with government source credits (handlooms.gov.in, silkmarkindia.com, ipindia.gov.in, csb.gov.in, craftscouncilofindia.org)

---

## v3.5 · Aug 22 2026 — Product Catalogue, Offers & UI Fixes

### v3.5-1 · Our Story UI Redesign
**File:** `amayaa_about.html`
- Weaver cards redesigned from 4-column vertical stack → 2-column horizontal profile cards (130×130px square image left, text right)
- Promise cards: `.vs-grid` changed from `repeat(3,1fr)` → `repeat(4,1fr)` — all 4 in one row
- Font sizes increased: `.wcard-name` 18→22px, `.wcard-region` 11→13px, `.wcard-desc` 13→15px

### v3.5-2 · 30-Product Catalogue
**Files:** `data/products.json`, `data/products_index.json`, `data/products/AMY-*.json` (18 new files)
- 18 new sarees added, reaching 30 total
- Coverage: Nauvari, Phulkari, Gadwal, Kasavu, Banarasi Georgette, Chettinad, Kotpad, Dhakai Jamdani, Kanjivaram Bridal, Bhagalpuri Linen, Bomkai, Ilkal, Patan Patola, Rajkot Bandhani, Tant Jamdani Fusion, Madurai Sungudi, Assam Khadi, Sualkuchi Muga
- Price range ₹1,800–₹22,000; all regions, fabrics, occasions, badge combinations represented
- New 18 use gradient placeholders (`thumbnail: null`) — real photos can be swapped in via admin
- 18 individual `data/products/AMY-XXX.json` detail files created (required for product drawer)
- Original 12 real image thumbnails preserved correctly

### v3.5-3 · Offers Page — Full Sort/Filter Fix
**File:** `amayaa_offers.html`
- `sortOffers()` and `filterOffers()` were called from HTML but never defined — now fully implemented
- `_allOfferItems`, `_activeOfferFilter`, `_activeOfferSort` exposed on `window` for stateful re-renders
- `_renderOfferGrid()` applies current filter then sort and re-renders grid
- All 4 sort options working: Featured First, Price Low→High, Price High→Low, Highest Saving
- All 5 filter chips working: All / Silk Sarees / Cotton Sarees / Wedding / Festive
- Offer count dynamic — JS counts `originalPrice > price` products after load, updates chip label and stat
- Sort select + filter chips moved onto same horizontal row (`.off-sort-chips-row`)
- Stats strip font increased: `.ostat-main` 13→15px, `.ostat-sub` 11→12px; items properly centered
- "Offer valid while stocks last" restored as fine-print below heading
- "All prices inclusive of GST" removed from stats bar

### v3.5-4 · Sarees Page — Sort Fix + Alignment
**File:** `amayaa_sarees.html`
- Sort `_sort()` function was matching `val.indexOf('Low to High')` against option values (`price-asc` etc.) — always -1, so sort never worked. Fixed to `val === 'price-asc'` etc.
- Filters button and sort select given identical `height:42px; box-sizing:border-box` for horizontal alignment

### v3.5-5 · Product Drawer — GST Fine Print
**Files:** `product-drawer.js`, `product-drawer.css`
- `<div class="pd-gst-note">All prices inclusive of GST</div>` added below price row in every product drawer
- `.pd-gst-note` styled at 11px, muted `#9A8070`, appears on every saree detail view across all pages

---

## v3.6 · Aug 22 2026 — GoatCounter Visitor Count Fix

### v3.6-1 · Homepage Visitor Counter — Live from settings.json
**File:** `index.html`
- `#vc` element was hardcoded to `12,847` — not connected to any data source
- Now fetches `data/settings.json` on load and displays `siteStats.visitorCount` (formatted with `toLocaleString('en-IN')`)
- Fetch is fire-and-forget with silent catch — no visible impact if offline or fetch fails

### v3.6-2 · Admin Dashboard — Visitor Stat Wired to settings.json
**File:** `amayaa_admin/amayaa_dashboard.html`
- "Total Visitors" stat card value (`#dash-visitors`) was hardcoded to `12,847`
- Now reads live from `settings.json` via GitHub API on dashboard load
- Sub-label (`#dash-visitors-sub`) shows "Last synced: YYYY-MM-DD" from `siteStats.lastSynced`
- Falls back to "Token needed" if GitHub token is not in localStorage

### v3.6-3 · "Refresh from GoatCounter" Button on Dashboard
**File:** `amayaa_admin/amayaa_dashboard.html`
- Small button added inside the Total Visitors stat card
- On click: prompts for GoatCounter API token (stored in `localStorage` under `amayaa_gc_token` — never in git)
- Calls `https://amayaa.goatcounter.com/api/v0/stats/total` with `Authorization: Bearer <gc_token>`
- On success: reads current `settings.json` SHA via GitHub API, updates `siteStats.visitorCount` and `siteStats.lastSynced`, PUTs back via GitHub API
- Stat card updates live; button shows ✅ for 3s then resets
- On bad GC token: clears `amayaa_gc_token` from localStorage so next click re-prompts

### How to Use (Admin Instructions)

**One-time setup:**
1. In GoatCounter dashboard → Settings → API tokens → Create a new token (read permission is enough)
2. In Admin Dashboard → Total Visitors → click "🔄 Refresh from GoatCounter"
3. Paste your GoatCounter API token when prompted — it is saved locally in your browser only

**Ongoing:**
- Whenever you want the homepage to show a fresh count, open Admin Dashboard and click Refresh
- Each refresh saves the count to `settings.json` via a GitHub commit — the homepage picks it up within seconds of GitHub Pages rebuild (~30s)
- You do NOT need to push code — the refresh button handles the GitHub API write automatically

**Token storage keys (localStorage only, never in git):**
- `amayaa_gh_token` — GitHub Personal Access Token (for all admin saves)
- `amayaa_gc_token` — GoatCounter API token (for visitor count refresh only)

---

## v3.7 · Aug 22 2026 — ImageKit CDN Integration

**ImageKit endpoint:** `https://ik.imagekit.io/Amayaa2026`
**Transform applied to all URLs:** `?tr=f-auto,q-85` (auto format WebP/AVIF, 85% quality)

### v3.7-1 · Data JSON Migration (all local paths → ImageKit URLs)
All 7 data files migrated — zero local `images/` paths remain:
- `data/products_index.json` — 12 product thumbnails
- `data/products/AMY-*.json` — 12 individual product files (thumbnail + photos)
- `data/products.json` — legacy combined file (12 thumbnails)
- `data/banners.json` — 6 backgroundImage fields
- `data/collections.json` — 6 image fields (ourcollections folder)
- `data/about.json` — 2 story images (ourstory) + 4 weaver photos (weaverprofiles)
- `data/blog.json` — 7 thumbnailImage + 7 coverImage fields added/updated

**Folder mapping (local → ImageKit):**
- `images/products/` → `ik.../products/`
- `images/banners/` → `ik.../banners/`
- `images/logos/` → `ik.../logos/`
- `images/OurCollections/` → `ik.../ourcollections/`
- `images/OurStory/` → `ik.../ourstory/`
- `images/WeaverProfiles/` → `ik.../weaverprofiles/`
- `images/blog/` → `ik.../blog/`

### v3.7-2 · Hardcoded HTML Paths Updated
- `amayaa_about.html` — 6 hardcoded `<img src>` tags (2 story + 4 weaver)
- `nav.js` — 2 logo refs inside search overlay HTML string + footer HTML string
- `coming_soon.html` — 1 logo ref
- `index.html` — collections grid static fallback (6 `background-image:url(...)`)

### v3.7-3 · Shared imagekit.js Helper
**File:** `amayaa_admin/imagekit.js`
- `_ikUpload(file, folder)` → POSTs to `https://upload.imagekit.io/api/v1/files/upload` using private key from `localStorage.amayaa_ik_private_key`, returns full IK URL + transforms
- `_ikPick(folder, onUrl, statusEl)` → opens file picker, validates size (5MB), calls `_ikUpload`, invokes callback with URL
- On bad key: auto-clears localStorage so next call re-prompts
- Loaded as `<script src="imagekit.js">` in banners, blog, and product edit pages

### v3.7-4 · Banner Manager — Upload via ImageKit
**File:** `amayaa_admin/amayaa_banners.html`
- `uploadImage()` rewired from GitHub API base64 upload → `_ikPick('/banners', ...)`
- URL from ImageKit saved directly into the `backgroundImage` field + preview updated
- No GitHub API call for image binary — only for the banners.json metadata save

### v3.7-5 · Blog Admin — Upload via ImageKit
**File:** `amayaa_admin/amayaa_blog.html`
- `uploadThumb()` rewired from GitHub API base64 upload → `_ikPick('/blog', ...)`
- IK URL saved to `bf-thumbnail` field + preview box updated

### v3.7-6 · Product Edit — Photo Upload Panel
**File:** `amayaa_admin/amayaa_product_edit.html`
- Static placeholder grid replaced with dynamic `#photo-grid` rendered by `_renderPhotoGrid()`
- `_productPhotos[]` array stores all uploaded IK URLs in session
- `_addPhoto()` calls `_ikPick('/products', ...)` — appends URL, re-renders grid
- `_removePhoto(idx)` removes by index, re-renders
- First photo in array = MAIN image (shown with badge)
- Duplicate GoatCounter script tag removed

### v3.7-7 · ImageKit Key in Admin Settings
**File:** `amayaa_admin/amayaa_settings.html`
- New "ImageKit Private Key" input block added below GitHub token section
- `saveIkToken()` / `clearIkToken()` functions + `_checkIkToken()` on load
- Key stored in `localStorage.amayaa_ik_private_key` — never in git repo

### Admin Setup Instructions
1. Go to **Admin → Settings** — paste your ImageKit **private API key** (from imagekit.io → Developer Options → API Keys) in the "ImageKit Private Key" field
2. Upload images for: first use `amayaa_admin/amayaa_banners.html` or `amayaa_admin/amayaa_blog.html` — the key prompt will appear if not yet saved
3. For products: open Product Edit → click "Upload Photo" — images go directly to IK `/products/` folder

---

## Pending for Launch

| Item | Priority | Notes |
|---|---|---|
| Real photos for 18 new sarees | High | Gradient placeholders active; upload via Admin Product Edit |
| #68 GoatCounter audit | Medium | Tracking script confirmed on all pages. Visitor count wired (v3.6). Remaining: verify GC events fire correctly end-to-end |
| #69 ImageKit.io CDN | ✅ Done | All image paths migrated. Admin uploads wired. imagekit.js helper created. Needs: upload actual images to IK + store private key in Admin Settings. |
| #71 Formspree contact form | Medium | Verify form submits and email arrives |
| #74 Full functional testing | High | All pages, all filters, all drawers, mobile + desktop |
| #77 Custom domain email | Low | hello@amayaabypolkadots.in setup |
| Typography admin wiring | Low | Currently read-only preview; save not wired |
| Dashboard live analytics | Low | GoatCounter API + WA click counter |
