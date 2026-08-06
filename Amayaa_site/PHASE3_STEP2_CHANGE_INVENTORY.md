# Phase 3 — Step 2: Change Inventory & Regression Checklist
**Prepared before any code is written**  
**Purpose:** Every change that will be made, file by file. Sign off on this, then use it as the regression test checklist after changes are applied.

---

## WHAT IS BEING BUILT

| New file | Purpose |
|---|---|
| `nav.js` | Injects full nav bar + mobile top bar + mobile backdrop + mobile slide-in panel + search overlay into every page. Auto-detects active page from URL. |
| `footer.js` | Injects full footer + WhatsApp FAB into every page. |
| `public.css` | 138 CSS rules that are byte-for-byte identical across all 7 pages. Loaded via `<link>` tag in `<head>`. |

---

## PRE-EXISTING BUGS FOUND DURING ANALYSIS
*(Not caused by Step 2 — found during code reading. Will fix during this pass.)*

| # | File | Bug | Fix |
|---|---|---|---|
| B1 | `amayaa_offers.html` | Footer has 3 broken links: `sarees.html?filter=new`, `sarees.html?occasion=wedding`, `blog.html?cat=care` (missing `amayaa_` prefix) | Fix to `amayaa_sarees.html?...` and `amayaa_blog.html?...` — these will be correct in `footer.js` |
| B2 | `amayaa_about.html` | Duplicate GoatCounter `<script>` tag at line 1122 (already present at line 1001) — fires analytics twice per visit | Remove the duplicate at line 1122 |
| B3 | `index.html` + `amayaa_product.html` | Search button in nav calls `getElementById('srchOverlay')` but no search overlay `<div>` exists on these two pages → search is silently broken | `nav.js` injects the search overlay on all pages — fixes this automatically |

---

## CHANGE MAP — FILE BY FILE

### SECTION A: Changes identical across all 7 pages

---

#### A1 — `<head>` block (all 7 pages)
**Add one line** after the Google Fonts `<link>` tag:
```html
<link rel="stylesheet" href="/public.css">
```
Specific line numbers:
| File | Insert after line |
|---|---|
| index.html | 12 |
| amayaa_sarees.html | 14 |
| amayaa_blog.html | 7 |
| amayaa_about.html | 7 |
| amayaa_contact.html | 7 |
| amayaa_offers.html | 14 |
| amayaa_product.html | 9 |

**Regression check A1:** On every page, open browser DevTools → Network tab → confirm `public.css` loads with HTTP 200. Confirm no 404.

---

#### A2 — Nav block replacement (all 7 pages)
**Remove** the entire nav block (nav-wrap div + mob-topbar + mob-backdrop + mob-panel) and **replace** with:
```html
<div id="nav-wrap"></div>
<script src="/nav.js"></script>
```

Block line ranges being removed:
| File | Lines removed |
|---|---|
| index.html | 603 → 671 |
| amayaa_sarees.html | 861 → 929 |
| amayaa_blog.html | 744 → 812 |
| amayaa_about.html | 847 → 915 |
| amayaa_contact.html | 600 → 668 |
| amayaa_offers.html | 666 → 734 |
| amayaa_product.html | 663 → 731 |

**Regression checks A2:**
- [ ] Desktop: Nav pill appears at top of every page
- [ ] Desktop: Logo seal visible on left of pill
- [ ] Desktop: Brand name visible next to seal
- [ ] Desktop: All 6 nav links visible (Home, Sarees, Blog, Our Story, Special Offers, Contact)
- [ ] Desktop: Special Offers link has gift emoji and terracotta colour
- [ ] Desktop: Search icon button visible on right of pill
- [ ] Desktop: WhatsApp icon button visible on right of pill
- [ ] Desktop: Nav is sticky — stays at top when scrolling
- [ ] Mobile: Desktop pill nav is hidden
- [ ] Mobile: Mobile top bar appears (logo + hamburger)
- [ ] Mobile: Hamburger tap → slide-in panel opens from left
- [ ] Mobile: Backdrop (dimmed overlay) appears behind panel
- [ ] Mobile: Tapping backdrop closes panel
- [ ] Mobile: × button closes panel
- [ ] Mobile: WhatsApp button visible at bottom of mobile panel
- [ ] Mobile: Panel nav links all visible and tappable

---

#### A3 — Active page highlighting (nav.js auto-detection)
`nav.js` will detect the current page from `window.location.pathname` and add `class="active"` to the matching nav link. Removes the hardcoded `class="active"` from each page's static HTML.

Active link mapping:
| Page | Active nav link |
|---|---|
| index.html | Home |
| amayaa_sarees.html | Sarees |
| amayaa_blog.html | Blog |
| amayaa_about.html | Our Story |
| amayaa_contact.html | Contact |
| amayaa_offers.html | Special Offers |
| amayaa_product.html | Sarees (product is a child of Sarees) |

**Regression checks A3:**
- [ ] On each page, the correct nav link is visually highlighted/bold as active
- [ ] No page shows two active links simultaneously
- [ ] Home link is NOT double-highlighted on any page

---

#### A4 — Search overlay block (5 pages: sarees, blog, about, contact, offers)
The search overlay `<div id="srchOverlay">` block currently sits at the bottom of the page body on 5 pages. It moves into `nav.js` (injected on all 7 pages — also fixing the broken search on index and product pages).

Block line ranges being removed from each page:
| File | Lines removed |
|---|---|
| amayaa_sarees.html | 1194 → 1229 |
| amayaa_blog.html | 946 → 981 |
| amayaa_about.html | 1006 → 1041 |
| amayaa_contact.html | 813 → 848 |
| amayaa_offers.html | 938 → 973 |
| index.html | (not present — injected fresh by nav.js) |
| amayaa_product.html | (not present — injected fresh by nav.js) |

**Regression checks A4:**
- [ ] Clicking the search (🔍) button opens the search overlay on ALL 7 pages
- [ ] Search input auto-focuses when overlay opens
- [ ] Typing in search input shows results
- [ ] Clicking × or pressing Escape closes the overlay
- [ ] Search works on index.html (previously broken — now fixed)
- [ ] Search works on amayaa_product.html (previously broken — now fixed)

---

#### A5 — Footer block replacement (all 7 pages)
**Remove** the footer block + WhatsApp FAB `<a class="waf">` and **replace** with:
```html
<div id="footer-wrap"></div>
<script src="/footer.js"></script>
```

Block line ranges being removed:
| File | Footer lines | WAF lines |
|---|---|---|
| index.html | 804 → 844 | 845 → 847 |
| amayaa_sarees.html | 1145 → 1185 | 1186 → 1188 |
| amayaa_blog.html | 897 → 937 | 938 → 940 |
| amayaa_about.html | 957 → 997 | 998 → 1000 |
| amayaa_contact.html | 764 → 804 | 805 → 807 |
| amayaa_offers.html | 889 → 929 | 930 → 932 |
| amayaa_product.html | 828 → 868 | 869 → 871 |

**Regression checks A5:**
- [ ] Footer appears on every page
- [ ] Footer logo seal (72px) visible
- [ ] Footer brand name visible
- [ ] Footer tagline text visible
- [ ] Instagram / Facebook / YouTube social icons visible and linked correctly
- [ ] "Shop" column: All Sarees, New Arrivals, Special Offers, Wedding links present
- [ ] "Discover" column: Our Story, Blog, Care Guide links present
- [ ] "Connect" column: Contact Us, WhatsApp, Email Us, Visit Store links present
- [ ] Copyright line at bottom of footer
- [ ] WhatsApp FAB (floating green button) visible at bottom-right on all pages
- [ ] WhatsApp FAB links to correct wa.me URL
- [ ] **offers.html specific:** New Arrivals and Wedding links now go to `amayaa_sarees.html?...` (bug fix B1 verified)

---

#### A6 — `<style>` block reduction (all 7 pages)
Remove 138 CSS selectors that move to `public.css`. Each page's `<style>` block shrinks from ~32KB to ~17KB. Only page-unique CSS remains inline.

CSS moving to `public.css` includes:
- All nav CSS: `.nav-wrap`, `.nav-pill`, `.nav-seal`, `.nav-brand`, `.nav-links`, `.nav-wa`, `.nav-srch-btn`, `.mob-topbar`, `.mob-seal`, `.mob-ham`, `.mob-backdrop`, `.mob-panel`, `.mob-panel-*`
- All footer CSS: `.ft`, `.fi2`, `.fg2`, `.fc`, `.fb2`, `.fsc`, `.fsb`, `.ftag`, `.waf`
- Hero CSS: `.hero`, `.slide`, `.slide-ct`, `.slide-ov`, `.slide-bg`, `.s1`–`.s5 .slide-bg`, `.dots`, `.dot`, `.scroll-hint`, `.sh-arrow`, `.sh-text`, `.home-content`
- Background orbs CSS: `.orbs`, `.orb` (structure only — colours stay per-page)
- Shared UI: `body`, `.btn-p`, `.btn-o`, `.eye`, `.htitle`, `.hsub`, `.hbtns`
- Trust strip: `.ti`, `.tc`, `.ticon`, `.ttitle`, `.tdesc`
- Visitor counter: `.vs`, `.vp`, `.vd`, `.vt`, `.vc`
- Blog preview cards (shared): `.pg3`, `.pg4`, `.bc` (base version), `.bt`, `.bb`, `.bcat`, `.bttl`, `.brm`, `.bmeta`, `.brm`
- Collection grid: `.cg`, `.ct`, `.cc`, `.cn`, `.cov`
- Search overlay: `.srch-overlay`, `.srch-bar`, `.srch-chips`, `.srch-chip`, `.srch-results`, `.sri-*`, `.srch-close`, `.srch-title`, `.srch-sub`
- Shared keyframes: `@keyframes fl`, `@keyframes gd`, `@keyframes wap`

**Regression checks A6:**
- [ ] Page background colour (Sage Ivory `#E4EEE0`) correct on all pages
- [ ] Body font (Jost) loads correctly on all pages
- [ ] Heading font (Cormorant Garamond) loads correctly on all pages
- [ ] No CSS rule appears to be "lost" (visual comparison of before/after)

---

### SECTION B: Page-specific changes

---

#### B — `index.html` specific
**No page-specific structural changes beyond Section A.**

Page-unique CSS staying in `<style>`:
- Orb colours: `.o1`–`.o5` (Sage/green palette)
- `.nav-wrap` top padding: `30px` (kept via public.css — same as all pages)
- `.section-trust`, `.section-arrivals`, `.section-blog`, `.section-collections` backgrounds
- Product card CSS: `.pc`, `.pi`, `.pbadges`, `.badge`, `.b-new`, `.b-offer`, `.b-sold`, `.pname`, `.ppr`, `.pnew`, `.pold`, `.psave`, `.preg`, `.pfab`
- Section layout: `.sec-lbl`, `.sec-ttl`, `.va`, `.va:hover`, `.pg3`, `.pg4`, `.pd`, `.pdots`
- Page-specific `position:fixed` on `.scroll-hint` and `margin-top:85vh!important` + background on `.home-content`

**Regression checks — index.html:**
- [ ] Hero slider cycles through 5 slides automatically
- [ ] Slide dot indicators visible and match active slide
- [ ] "Explore" arrow button visible, scrolls to collections section
- [ ] Explore arrow hides when footer is in view
- [ ] Collections grid (6 region tiles) displays correctly
- [ ] Trust strip (4 icon cards) displays correctly
- [ ] New Arrivals grid (4 product cards) displays correctly
- [ ] Blog preview grid (3 cards) displays correctly
- [ ] Visitor counter displays

---

#### B — `amayaa_sarees.html` specific
**No additional structural changes beyond Section A.**

Page-unique CSS staying in `<style>`: 143 unique selectors — all sarees-specific (sidebar filters, product grid, pagination, sort select, filter chips, mobile filter bar, left lollipop nav, breadcrumb, etc.)

**Regression checks — amayaa_sarees.html:**
- [ ] Orb palette is terracotta/gold (not green)
- [ ] Sidebar filters panel visible on desktop
- [ ] Filter categories (Type, Region, Occasion, Price, Fabric) all expand/collapse
- [ ] Product grid displays correctly (4-across on desktop)
- [ ] Product cards show gradient image, name, price, region, badge
- [ ] Filter chips row visible when filters applied
- [ ] Sort dropdown functional
- [ ] Pagination controls visible
- [ ] Mobile: sidebar collapses, top filter bar appears
- [ ] Left lollipop nav visible on desktop

---

#### B — `amayaa_blog.html` specific
**No additional structural changes beyond Section A.**

Page-unique CSS staying in `<style>`: 98 unique selectors — blog grid, category filter buttons, blog cards, page header.

**Regression checks — amayaa_blog.html:**
- [ ] Orb palette is green (same as home)
- [ ] Category filter buttons row visible
- [ ] Blog card grid (3-column) displays correctly
- [ ] Blog cards show gradient image, category label, title, meta, read-more link
- [ ] Odd last card centres correctly in grid

---

#### B — `amayaa_about.html` specific
**Additional changes beyond Section A:**
- **Remove duplicate GoatCounter `<script>` tag** at line 1122 (bug fix B2)
- **Remove dead CSS block** — `.nav-wrap { padding:16px 28px 0 }` (the `30px` rule later in same `<style>` overrides it; the `16px` rule is dead code and will be removed)

Page-unique CSS staying in `<style>`: 109 unique selectors — story grid (zigzag sections), values strip, weavers grid, wcard, hero-about, etc. Orb palette is plum/lavender.

**Regression checks — amayaa_about.html:**
- [ ] Orb palette is plum/lavender
- [ ] Page header ("Our Story") hero section visible
- [ ] Story sections in zigzag layout (alternating text-left/image-right)
- [ ] Values strip (4 values) displays correctly
- [ ] Weavers grid displays correctly
- [ ] GoatCounter fires exactly once per page visit (verify in amayaa.goatcounter.com — was firing twice before)
- [ ] Nav pill padding is same as all other pages (30px top — visually verify seal alignment)

---

#### B — `amayaa_contact.html` specific
**No additional structural changes beyond Section A.**

Page-unique CSS staying in `<style>`: 58 unique selectors — contact form, map embed, store info cards, hours grid, WhatsApp CTA button.

**Regression checks — amayaa_contact.html:**
- [ ] Contact form fields (Name, Email, Phone, Message) display correctly
- [ ] Send Message button visible
- [ ] WhatsApp CTA button visible below form
- [ ] Store info cards (address, phone, email, hours) display correctly
- [ ] Hours grid (Mon–Sat / Sunday) displays correctly
- [ ] Map embed loads
- [ ] Form submit sends to Formspree (test once: fill + submit, check stylewithpolkadots@gmail.com)

---

#### B — `amayaa_offers.html` specific
**Additional changes beyond Section A:**
- Footer bug fix B1: `sarees.html?filter=new` → `amayaa_sarees.html?filter=new`
- Footer bug fix B1: `sarees.html?occasion=wedding` → `amayaa_sarees.html?occasion=wedding`
- Footer bug fix B1: `blog.html?cat=care` → `amayaa_blog.html?cat=care`
*(These fixes are baked into footer.js — offers.html will get the corrected footer automatically.)*

Page-unique CSS staying in `<style>`: 41 unique selectors — offers filter chips, offer product grid, explore indicator, sort select.

**Regression checks — amayaa_offers.html:**
- [ ] Orb palette is rose/coral
- [ ] Filter chip row (All, Banarasi, Kanjivaram, etc.) displays correctly
- [ ] Offers product grid displays correctly
- [ ] Footer links: New Arrivals → `amayaa_sarees.html?filter=new` ✓ (was broken before)
- [ ] Footer links: Wedding → `amayaa_sarees.html?occasion=wedding` ✓ (was broken before)
- [ ] Footer links: Care Guide → `amayaa_blog.html?cat=care` ✓ (was broken before)

---

#### B — `amayaa_product.html` specific
**No additional structural changes beyond Section A.**

Page-unique CSS staying in `<style>`: 86 unique selectors — product detail layout, image thumbnails, spec table, accordion, related products, CTA buttons, price block.

**Regression checks — amayaa_product.html:**
- [ ] Orb palette is amber/gold
- [ ] Product image main display + thumbnail strip visible
- [ ] Product name, eyebrow label, region, price visible
- [ ] Spec table (fabric, region, care, weaving time) displays correctly
- [ ] Accordion (care instructions, story) expands/collapses
- [ ] WhatsApp Enquire + Call buttons visible
- [ ] Related products section visible at bottom

---

## SUMMARY TABLE — ALL CHANGES

| Change | Files affected | Lines removed | New lines added |
|---|---|---|---|
| Add `<link>` for public.css | All 7 | 0 | 1 per page = 7 |
| Remove + replace nav block | All 7 | ~69 per page = ~483 total | 2 per page = 14 |
| Remove search overlay block | 5 pages | ~35 per page = ~175 total | 0 (moves to nav.js) |
| Remove + replace footer+WAF | All 7 | ~43 per page = ~301 total | 2 per page = 14 |
| Shrink `<style>` block | All 7 | ~138 rules per page | 0 (moves to public.css) |
| Fix broken footer links | offers.html only | 3 lines | 3 lines |
| Remove duplicate GoatCounter | about.html only | 1 line | 0 |
| Remove dead `.nav-wrap` CSS | about.html only | ~3 lines | 0 |
| **New file: nav.js** | — | — | ~120 lines |
| **New file: footer.js** | — | — | ~60 lines |
| **New file: public.css** | — | — | ~280 lines |

---

## REGRESSION TEST SEQUENCE

Run these in order after all changes are applied:

### Step 1 — Local server test
```bash
cd ~/Downloads/Amayaa_site
python3 -m http.server 8080
```
Open `http://localhost:8080` — verify all 7 pages load without console errors.

### Step 2 — DevTools checks (on localhost)
On each page:
- [ ] Console: zero JS errors
- [ ] Console: zero 404s for nav.js, footer.js, public.css
- [ ] Network: `public.css` loads once
- [ ] Network: `nav.js` loads once
- [ ] Network: `footer.js` loads once

### Step 3 — Visual regression (all 7 pages × desktop + mobile)
For each page at 1280px (desktop) and 390px (mobile iPhone):
- [ ] Nav renders correctly (seal, pill, links)
- [ ] Active nav link correctly highlighted
- [ ] Page content area unchanged
- [ ] Footer renders correctly (4-column grid)
- [ ] WhatsApp FAB visible

### Step 4 — Interaction tests
- [ ] Hamburger → mobile panel opens
- [ ] Backdrop click → closes panel
- [ ] Search button → overlay opens, input focuses
- [ ] Search: type "banarasi" → results appear
- [ ] Search × → overlay closes
- [ ] Explore arrow (home) → smooth scrolls to collections

### Step 5 — Run the existing test script
```bash
bash ~/Downloads/test_and_deploy.sh test
```
All 306 checks must pass.

### Step 6 — Deploy if tests pass
```bash
bash ~/Downloads/test_and_deploy.sh deploy
```

---

## WHAT DOES NOT CHANGE

Explicitly listing what is NOT touched to confirm no scope creep:

- Admin panel (`amayaa_admin/` folder) — zero changes
- `sidebar.js` — zero changes
- `admin.css` — zero changes
- `CNAME` — zero changes
- `test_and_deploy.sh` — zero changes
- All page-specific content (hero text, product cards, blog cards, contact form, about sections, offers grid) — zero changes
- All inline JavaScript on each page (slider JS, filter JS, accordion JS, etc.) — zero changes
- GoatCounter script tag — zero changes (except removing the duplicate on about.html)
- Formspree form action — zero changes
