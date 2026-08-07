# Amayaa — Search Results Page & Product Drawer Overlay
## Change Log & Design Spec
**Status:** Revision 2 — Finalised August 7 2026  
**Date:** August 2026  
**Affects:** amayaa_search.html (UPDATE), product-drawer.js (UPDATE), product-drawer.css (UPDATE), nav.js (UPDATE), public.css (UPDATE)

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
