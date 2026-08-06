# Amayaa — Search Results Page & Product Drawer Overlay
## Change Log & Design Spec
**Status:** Finalised — ready for implementation  
**Date:** August 2026  
**Affects:** amayaa_search.html (NEW), product-drawer.js (NEW), product-drawer.css (NEW), nav.js (UPDATE)

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
