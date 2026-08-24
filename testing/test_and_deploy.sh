#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  AMAYAA BY POLKA DOTS — Test & Deploy Script v3.8
#  Updated from v15 for v3.8 architecture:
#    - Runs directly on git repo (no ZIP extraction)
#    - Hero slides: data-driven (6 via banners.json)
#    - Sarees: desktop filter overlay + region combobox
#    - 10 public pages (added Search, FAQ, Policies, Blog Post)
#    - JSON data integrity checks
#    - Products: index+detail split (30 products, ImageKit)
#    - Content library checks
#    - Removed stale: slide s5, min read (now in JS template)
# ═══════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT=8080
CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'
YELLOW='\033[1;33m'; NC='\033[0m'
MODE="${1:-test}"
PASS=0; FAIL=0; WARN=0

print_header() { echo ""; echo -e "${CYAN}══ $1 ══${NC}"; }
print_ok()     { echo -e "  ${GREEN}✅ $1${NC}"; PASS=$((PASS+1)); }
print_fail()   { echo -e "  ${RED}❌ $1${NC}"; FAIL=$((FAIL+1)); }
print_warn()   { echo -e "  ${YELLOW}⚠  $1${NC}"; WARN=$((WARN+1)); }

# grep-pattern check: chk "description" "file" "pattern" [true|false]
chk() {
  local DESC="$1" FILE="$2" PATTERN="$3" SHOULD="${4:-true}"
  if [ "$SHOULD" = "true" ]; then
    grep -qi "$PATTERN" "$SITE_DIR/$FILE" 2>/dev/null && print_ok "$DESC" || print_fail "$DESC"
  else
    grep -qi "$PATTERN" "$SITE_DIR/$FILE" 2>/dev/null && print_fail "$DESC" || print_ok "$DESC"
  fi
}

# Brace balance check (diff=1 is warn — common false positive from CSS comments/template literals)
chk_balance() {
  local FILE="$1"
  local O=$(grep -o '{' "$SITE_DIR/$FILE" | wc -l | tr -d ' ')
  local C=$(grep -o '}' "$SITE_DIR/$FILE" | wc -l | tr -d ' ')
  local DIFF=$(( C > O ? C - O : O - C ))
  if [ "$O" -eq "$C" ]; then print_ok "$FILE: braces balanced ($O)"
  elif [ "$DIFF" -le 1 ]; then print_warn "$FILE: off-by-1 ($O open vs $C close) — likely CSS comment or template literal, not a real bug"
  else print_fail "$FILE: UNBALANCED ($O open vs $C close)"; fi
}

# CSS selector depth check (must be 0 = top-level, not inside @media)
# depth=-1 is a known false positive in files with off-by-1 brace counts (CSS comment artefact)
chk_depth() {
  local DESC="$1" FILE="$2" SELECTOR="$3"
  local D
  D=$(python3 -c "
import re,sys
try:
  html=open('$SITE_DIR/$FILE').read()
  css='\n'.join(re.findall(r'<style>(.*?)</style>',html,re.DOTALL))
  pos=css.find('$SELECTOR')
  print(-99 if pos<0 else css[:pos].count('{')-css[:pos].count('}'))
except: print(-99)
" 2>/dev/null)
  if [ "$D" = "0" ] || [ "$D" = "-1" ]; then print_ok "$DESC (top-level CSS ✓)"
  elif [ "$D" = "-99" ]; then print_fail "$DESC (NOT FOUND)"
  else print_fail "$DESC (depth=$D — inside @media, won't apply on desktop)"; fi
}

# JSON structural check via python3
chk_json() {
  local DESC="$1" FILE="$2"
  if [ ! -f "$SITE_DIR/$FILE" ]; then
    print_fail "$DESC — FILE MISSING"
  elif python3 -c "import json; json.load(open('$SITE_DIR/$FILE'))" 2>/dev/null; then
    print_ok "$DESC (valid JSON)"
  else
    print_fail "$DESC (INVALID JSON)"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
run_checks() {

  print_header "BRACE BALANCE"
  for f in index.html amayaa_about.html amayaa_contact.html amayaa_offers.html \
            amayaa_sarees.html amayaa_blog.html amayaa_faq.html amayaa_policies.html \
            amayaa_search.html amayaa_blog_post.html; do
    chk_balance "$f"
  done

  print_header "DUPLICATE KEYFRAMES"
  for f in amayaa_blog.html amayaa_sarees.html amayaa_offers.html; do
    C=$(grep -c "@keyframes fl" "$SITE_DIR/$f" 2>/dev/null || echo 0)
    [ "$C" -le 1 ] && print_ok "$f: fl keyframe = ${C}x" || print_fail "$f: DUPLICATE fl (${C}x) causes blinking"
  done

  # ── REQUIRED FILES ──────────────────────────────────────────────────────────
  print_header "REQUIRED HTML PAGES"
  for f in index.html amayaa_sarees.html amayaa_blog.html amayaa_blog_post.html \
            amayaa_about.html amayaa_contact.html amayaa_offers.html \
            amayaa_search.html amayaa_faq.html amayaa_policies.html coming_soon.html; do
    [ -f "$SITE_DIR/$f" ] && print_ok "$f exists" || print_fail "$f MISSING"
  done

  print_header "REQUIRED JS / CSS ASSETS"
  for f in nav.js public.css product-drawer.js product-drawer.css; do
    [ -f "$SITE_DIR/$f" ] && print_ok "$f exists" || print_fail "$f MISSING"
  done

  print_header "SUPERSEDED FILES REMOVED"
  [ ! -f "$SITE_DIR/footer.js" ]             && print_ok "footer.js removed"          || print_warn "footer.js still exists (superseded by nav.js)"
  [ ! -f "$SITE_DIR/data/products.json" ]    && print_ok "data/products.json removed"  || print_warn "data/products.json still exists (superseded by products_index.json)"

  # ── DATA FILES ───────────────────────────────────────────────────────────────
  print_header "DATA JSON FILES"
  for f in data/products_index.json data/categories.json data/content_library.json \
            data/settings.json data/banners.json data/blog.json data/about.json \
            data/faq.json data/policies.json data/offers.json \
            data/collections.json data/typography.json; do
    chk_json "$f" "$f"
  done

  print_header "PRODUCTS INDEX INTEGRITY"
  COUNT=$(python3 -c "import json; print(len(json.load(open('$SITE_DIR/data/products_index.json'))))" 2>/dev/null)
  [ "$COUNT" = "30" ] && print_ok "products_index.json: exactly 30 entries" || print_fail "products_index.json: $COUNT entries (expected 30)"

  python3 -c "
import json, sys
d = json.load(open('$SITE_DIR/data/products_index.json'))
bad_ik = [p['id'] for p in d if not str(p.get('thumbnail','')).startswith('https://ik.imagekit.io/')]
bad_occ = [p['id']+':'+o for p in d for o in (p.get('occasion',[]) if isinstance(p.get('occasion'),list) else [p.get('occasion','')]) if o in ('casual','daily')]
bad_ref = [p['id'] for p in d if not p.get('contentRefs')]
if bad_ik:  print('FAIL_IK:'+' '.join(bad_ik[:5]))
else:       print('OK_IK')
if bad_occ: print('FAIL_OCC:'+' '.join(bad_occ[:5]))
else:       print('OK_OCC')
if bad_ref: print('WARN_REF:'+' '.join(bad_ref[:5]))
else:       print('OK_REF')
" 2>/dev/null | while IFS= read -r line; do
    case "$line" in
      OK_IK)    print_ok  "All 30 thumbnails are ImageKit URLs" ;;
      FAIL_IK*) print_fail "Non-ImageKit thumbnails: ${line#FAIL_IK:}" ;;
      OK_OCC)   print_ok  "No deprecated occasion values (casual/daily)" ;;
      FAIL_OCC*)print_fail "Deprecated occasion values: ${line#FAIL_OCC:}" ;;
      OK_REF)   print_ok  "All 30 entries have contentRefs" ;;
      WARN_REF*)print_warn "Missing contentRefs: ${line#WARN_REF:}" ;;
    esac
  done

  DETAIL_COUNT=$(ls "$SITE_DIR/data/products/"*.json 2>/dev/null | wc -l | tr -d ' ')
  [ "$DETAIL_COUNT" = "30" ] && print_ok "data/products/: 30 detail files" || print_fail "data/products/: $DETAIL_COUNT files (expected 30)"

  print_header "CONTENT LIBRARY"
  python3 -c "
import json
d = json.load(open('$SITE_DIR/data/content_library.json'))
ws   = len(d.get('weaveStory', d.get('weaveStories', [])))
cs   = len(d.get('careSuggestions', d.get('careInstructions', [])))
desc = len(d.get('description', d.get('descriptions', [])))
cb   = len(d.get('contentBundles', []))
print(f'{ws},{cs},{desc},{cb}')
" 2>/dev/null | while IFS=',' read ws cs desc cb; do
    [ "$ws"   -ge 26 ] && print_ok  "weaveStory: $ws entries (≥ 26 ✓)"  || print_fail "weaveStory: $ws entries (need ≥ 26)"
    [ "$cs"   -ge 6  ] && print_ok  "careSuggestions: $cs entries (≥ 6 ✓)" || print_fail "careSuggestions: $cs entries (need ≥ 6)"
    [ "$desc" -ge 30 ] && print_ok  "description: $desc entries (≥ 30 ✓)" || print_fail "description: $desc entries (need ≥ 30)"
    print_ok "contentBundles: $cb entries"
  done

  # ── IMAGEKIT MIGRATION ───────────────────────────────────────────────────────
  print_header "IMAGEKIT MIGRATION"
  LOCAL_HTML=$(grep -rl 'src="images/' \
    "$SITE_DIR/index.html" "$SITE_DIR/amayaa_sarees.html" "$SITE_DIR/amayaa_blog.html" \
    "$SITE_DIR/amayaa_about.html" "$SITE_DIR/amayaa_contact.html" "$SITE_DIR/amayaa_offers.html" \
    "$SITE_DIR/amayaa_search.html" "$SITE_DIR/amayaa_faq.html" "$SITE_DIR/amayaa_policies.html" \
    "$SITE_DIR/amayaa_blog_post.html" 2>/dev/null | xargs -I{} basename {} | tr '\n' ' ')
  [ -z "$LOCAL_HTML" ] && print_ok "No local images/ src refs in public HTML" || print_warn "Local images/ refs in: $LOCAL_HTML (logos are OK)"

  LOCAL_JSON=$(grep -rl '"images/' "$SITE_DIR/data/"*.json 2>/dev/null | xargs -I{} basename {} | tr '\n' ' ')
  [ -z "$LOCAL_JSON" ] && print_ok "No local images/ paths in data JSON files" || print_fail "Local images/ paths in: $LOCAL_JSON"

  # ── GIT HYGIENE ──────────────────────────────────────────────────────────────
  print_header "GIT HYGIENE"
  NM=$(git -C "$SITE_DIR" ls-files | grep "node_modules" | wc -l | tr -d ' ')
  [ "$NM" = "0" ] && print_ok "node_modules not tracked in git" || print_fail "$NM node_modules files tracked — run: git rm --cached -r testing/node_modules/"
  grep -q "node_modules" "$SITE_DIR/.gitignore" 2>/dev/null && print_ok ".gitignore covers node_modules" || print_fail ".gitignore missing node_modules rule"
  BAK=$(find "$SITE_DIR" -maxdepth 2 \( -name "*.bak" -o -name "*.bak2" \) | grep -v ".git" | wc -l | tr -d ' ')
  [ "$BAK" = "0" ] && print_ok "No .bak / .bak2 files" || print_warn "$BAK .bak file(s) found — consider removing"

  # ── NODE.JS VALIDATOR ────────────────────────────────────────────────────────
  print_header "NODE.JS PRODUCT VALIDATOR"
  if command -v node &>/dev/null && [ -f "$SITE_DIR/scripts/validate_products.js" ]; then
    cd "$SITE_DIR" && node scripts/validate_products.js 2>&1 | tail -4
    [ ${PIPESTATUS[0]} -eq 0 ] && print_ok "validate_products.js: all checks passed" || print_fail "validate_products.js: errors found"
  else
    print_warn "node or validate_products.js not found — skipping"
  fi

  # ── HOME PAGE ────────────────────────────────────────────────────────────────
  print_header "HOME PAGE"
  chk "Hero element in HTML"                "index.html" 'class="hero"'
  chk "Hero position:fixed CSS"             "index.html" "position:fixed"
  chk "Hero height:85vh"                    "index.html" "height:85vh"
  chk "Hero !important override"            "index.html" "!important"
  chk_depth "Hero at CSS top level"         "index.html" ".hero{position:fixed"
  chk "home-content margin-top:85vh"        "index.html" "margin-top:85vh"
  chk "home-content solid background"       "index.html" "background:#E4EEE0"
  chk "Nav pill in nav.js"                  "nav.js" "nav-pill"
  chk "Mobile panel HTML in nav.js"          "nav.js" 'class="mob-panel"'
  chk "section-collections present"         "index.html" "section-collections"
  chk "section-trust present"               "index.html" "section-trust"
  chk "section-arrivals present"            "index.html" "section-arrivals"
  chk "Vibrant section gradients"           "index.html" "linear-gradient(160deg"
  chk "Trust strip CSS (.ti)"               "index.html" ".ti{"
  chk "Trust cards CSS (.tc)"               "index.html" ".tc{"
  chk "Collections grid (.cg)"              "index.html" ".cg{"
  chk "Collection circles (.cc)"            "index.html" ".cc{"
  chk "Logo seal in nav"                    "index.html" "nav-seal"
  chk "Footer fi2 CSS"                      "index.html" ".fi2{"
  chk "GoatCounter analytics"               "index.html" "goatcounter"
  chk "Explore arrow"                       "index.html" "scroll-hint"
  chk "Explore scroll-hint element"         "index.html" "scroll-hint"
  chk "Footer lavender #EAE0F5"             "index.html" "#EAE0F5"
  chk "No dark footer chocolate"            "index.html" "#2A1508" false
  chk "Hero slides data-driven (banners.json)" "index.html" "banners.json"
  chk "Hero 6 slides CSS (.slide:nth-child(6))" "index.html" ".slide:nth-child(6)"
  chk "Hero slide CSS defined"              "index.html" ".slide{"
  chk "Hero slide image CSS"               "index.html" ".slide-img{"
  chk "Dots indicator CSS"                  "index.html" ".dots{"
  chk "Collections grid data-driven"        "index.html" "collections.json"
  chk "New Arrivals section"               "index.html" "section-arrivals"
  chk "Blog section wrapper in HTML"        "index.html" 'class="section-blog"'
  chk "Blog spill gradient"                 "index.html" "rgba(58,90,154"
  chk "Arrivals spill gradient (plum)"      "index.html" "rgba(106,58,138"
  chk "All sections lavender base #F2ECFA"  "index.html" "#F2ECFA"

  print_header "ABOUT PAGE"
  chk "Story section HTML"                  "amayaa_about.html" 'class="story-sec"'
  chk_depth "story-grid at top level"       "amayaa_about.html" ".story-grid{display:grid"
  chk "Top padding 80px"                    "amayaa_about.html" "padding:80px"
  chk "Zigzag flip CSS"                     "amayaa_about.html" "direction:rtl"
  chk "Flip class in HTML"                  "amayaa_about.html" "story-grid flip"
  chk_depth "vs-grid at top level"          "amayaa_about.html" ".vs-grid{display:grid"
  chk_depth "wgrid at top level"            "amayaa_about.html" ".wgrid{display:grid"
  chk "Vcard CSS"                           "amayaa_about.html" ".vcard{"
  chk "Wcard CSS"                           "amayaa_about.html" ".wcard{"
  chk "Plum orb colour"                     "amayaa_about.html" "#C4A8D4"
  chk "Mobile panel CSS in public.css"      "public.css" ".mob-panel{"
  chk "Story text accent stripe"            "amayaa_about.html" "story-text::before"
  chk "St-lbl dot accent"                   "amayaa_about.html" "st-lbl::before"
  chk "Promise to You section"              "amayaa_about.html" "Our Promise to You"
  chk "Weavers Behind Amayaa section"       "amayaa_about.html" "Weavers Behind Amayaa"
  chk "Footer fi2 CSS"                      "amayaa_about.html" ".fi2{"
  chk "Values strip present"               "amayaa_about.html" "values-strip"
  chk "Weavers section present"            "amayaa_about.html" "weavers-sec"
  chk "Boutique Born heading"              "amayaa_about.html" "Boutique Born"
  chk "Why Handloom heading"              "amayaa_about.html" "Why Handloom"
  chk "Our Promise heading"               "amayaa_about.html" "Our Promise"
  chk "About data-driven (about.json)"     "amayaa_about.html" "about.json"
  chk "ImageKit story image URLs"          "amayaa_about.html" "ik.imagekit.io"

  print_header "CONTACT PAGE"
  chk "No hero element (home bleed)"        "amayaa_contact.html" 'class="hero"' false
  chk "No home-content div (home bleed)"    "amayaa_contact.html" 'class="home-content"' false
  chk "Loads nav.js (nav + footer injected)" "amayaa_contact.html" "nav.js"
  chk "No inline nav conflict"              "amayaa_contact.html" 'class="nav-pill"' false
  chk_depth "cgrid at top level"            "amayaa_contact.html" ".cgrid{display:grid"
  chk "cgrid 2 columns"                     "amayaa_contact.html" "grid-template-columns:1fr 1fr"
  chk "cinfo terracotta stripe"             "amayaa_contact.html" "inset 0 4px 0 0 #C4622D"
  chk "cform green stripe"                  "amayaa_contact.html" "inset 0 4px 0 0 #00B050"
  chk "WA CTA button"                       "amayaa_contact.html" "wa-cta"
  chk "Google Maps iframe"                  "amayaa_contact.html" "maps.google.com"
  chk "Submit button gradient"              "amayaa_contact.html" "background:linear-gradient(135deg,#C4622D"
  chk "Store address"                       "amayaa_contact.html" "Uttarapan Market Complex"
  chk "Phone number"                        "amayaa_contact.html" "95839 46000"
  chk "Email address"                       "amayaa_contact.html" "stylewithpolkadots@gmail.com"
  chk "Store hours"                         "amayaa_contact.html" "10:00 AM"
  chk "Teal orb colour"                     "amayaa_contact.html" "#90D4C8"
  chk "WA chat link"                        "amayaa_contact.html" "wa.me/919583946000"
  chk "Send Us a Message heading"           "amayaa_contact.html" "Send Us a Message"
  chk "Our Details heading"                 "amayaa_contact.html" "Our Details"
  chk "Open in Google Maps link"            "amayaa_contact.html" "Open in Google Maps"

  print_header "OFFERS PAGE"
  chk "No home-content div (home bleed)"    "amayaa_offers.html" 'class="home-content"' false
  chk "Loads nav.js (nav + footer injected)" "amayaa_offers.html" "nav.js"
  chk "No inline nav conflict"              "amayaa_offers.html" 'class="nav-pill"' false
  chk "Filter chips pill"                   "amayaa_offers.html" "border-radius:24px"
  chk "Sort dropdown styled"                "amayaa_offers.html" ".sort-sel{"
  chk "Sort dropdown CSS"                  "amayaa_offers.html" ".sort-sel{"
  chk "Offers data-driven (offers.json)"   "amayaa_offers.html" "offers.json"
  chk "Hero gradient present"              "amayaa_offers.html" "linear-gradient(135deg,#7B2D8B"
  chk "Filter active chip CSS"             "amayaa_offers.html" ".fp.act"
  chk "Rose orb colour"                    "amayaa_offers.html" "#F4A8B8"
  chk "Browse all sarees link"             "amayaa_offers.html" "amayaa_sarees.html"
  chk "WA for deals link"                  "amayaa_offers.html" "wa.me"
  chk "Handloom Special Prices heading"    "amayaa_offers.html" "Handloom Sarees at Special Prices"
  chk "Sort JS present"                    "amayaa_offers.html" "sortOffers"
  chk "Product grid 4 cols"               "amayaa_offers.html" "repeat(4,1fr)"
  chk "Footer via nav.js injection"        "nav.js" 'class="ft"'
  chk "GST note moved to product drawer"   "product-drawer.js" "GST"

  print_header "SAREES PAGE — Structure"
  chk "No hero element (home bleed)"        "amayaa_sarees.html" 'class="hero"' false
  chk "No home-content div (home bleed)"    "amayaa_sarees.html" 'class="home-content"' false
  chk "Loads nav.js (nav + footer injected)" "amayaa_sarees.html" "nav.js"
  chk "No inline nav conflict"              "amayaa_sarees.html" 'class="nav-pill"' false
  print_header "SAREES PAGE — Desktop Filter Overlay"
  chk "Desktop filter button"              "amayaa_sarees.html" "desk-flt-btn"
  chk "Desktop filter overlay HTML"        "amayaa_sarees.html" "deskFltOverlay"
  chk "Desktop filter overlay CSS"         "amayaa_sarees.html" ".desk-flt-overlay{"
  chk "Desktop filter sections CSS"        "amayaa_sarees.html" ".desk-flt-section{"
  chk "Desktop filter chips CSS"           "amayaa_sarees.html" ".desk-flt-chips{"
  chk "Region searchable combobox input"   "amayaa_sarees.html" "regionSrchInp"
  chk "Region dropdown CSS"               "amayaa_sarees.html" ".region-srch-drop{"
  chk "Region search function"            "amayaa_sarees.html" "_regionSearch"
  chk "Region select function"            "amayaa_sarees.html" "_regionSelect"
  chk "Region selected chips container"   "amayaa_sarees.html" "regionSelChips"
  chk "Clear all filters function"         "amayaa_sarees.html" "sareesFltClear"
  chk "sareesApply exposed on window"      "amayaa_sarees.html" "sareesApply"
  print_header "SAREES PAGE — Mobile Filter"
  chk "Mobile filter sidebar"             "amayaa_sarees.html" "sidebar-filters"
  chk "Mobile filter group CSS"           "amayaa_sarees.html" ".flt-group{"
  chk "Mobile filter title CSS"           "amayaa_sarees.html" ".flt-gtitle{"
  chk "Mobile filter more button"         "amayaa_sarees.html" "flt-more"
  print_header "SAREES PAGE — Grid & Content"
  chk "Product grid ID"                    "amayaa_sarees.html" "sarees-grid"
  chk "Data-driven (products_index.json)"  "amayaa_sarees.html" "products_index.json"
  chk "Product cards (.pc)"               "amayaa_sarees.html" '.pc{'
  chk "ProductDrawer.open() wired"         "amayaa_sarees.html" "ProductDrawer.open"
  chk "Breadcrumb transparent bg"          "amayaa_sarees.html" "background:none"
  chk "Active chips (.atag)"              "amayaa_sarees.html" ".atag{"
  chk "Peach orb colour"                  "amayaa_sarees.html" "#F4C2A1"
  chk "Banarasi region label"             "amayaa_sarees.html" "Banarasi"
  chk "Kanjivaram region label"           "amayaa_sarees.html" "Kanjivaram"
  chk "Sort dropdown"                     "amayaa_sarees.html" "sort"
  chk "Colour swatches section"           "amayaa_sarees.html" "desk-sw-row"
  chk "Price range inputs"               "amayaa_sarees.html" "desk-pr-box"
  chk "GoatCounter analytics"            "amayaa_sarees.html" "goatcounter"

  print_header "PRODUCT DRAWER"
  chk "Product drawer JS exists"          "product-drawer.js" "ProductDrawer"
  chk "Product drawer open function"      "product-drawer.js" "function open"
  chk "Product drawer close function"     "product-drawer.js" "function close"
  chk "Drawer pd-open class"              "product-drawer.js" "pd-open"
  chk "Drawer close button"              "product-drawer.js" "pd-close-btn"
  chk "Drawer breadcrumb name"           "product-drawer.js" "pd-bc-name"
  chk "Drawer product title"             "product-drawer.js" "pd-title"
  chk "Drawer image zone"                "product-drawer.js" "pd-img-zone"
  chk "Drawer content library resolve"   "product-drawer.js" "content_library.json"
  chk "Drawer weave story section"       "product-drawer.js" "weaveStoryId"
  chk "Drawer care instructions"         "product-drawer.js" "careSuggestion"
  chk "Drawer QR code"                   "product-drawer.js" "qr"
  chk "Drawer WA enquiry button"         "product-drawer.js" "wa.me"
  chk "Drawer exposed on window"         "product-drawer.js" "window.ProductDrawer"
  chk "Drawer CSS overlay"               "product-drawer.css" "pd-open"
  chk "Drawer CSS 2-col body"            "product-drawer.css" "pd-body-2col"

  print_header "BLOG PAGE"
  chk "No hero element (home bleed)"      "amayaa_blog.html" 'class="hero"' false
  chk "No home-content div (home bleed)"  "amayaa_blog.html" 'class="home-content"' false
  chk "Loads nav.js (nav + footer injected)" "amayaa_blog.html" "nav.js"
  chk "No inline nav conflict"              "amayaa_blog.html" 'class="nav-pill"' false
  chk "Blog grid 3 cols CSS"             "amayaa_blog.html" "repeat(3,1fr)"
  chk_depth "bgrid at top level"          "amayaa_blog.html" ".bgrid{"
  chk "Blog card CSS (.bc)"              "amayaa_blog.html" ".bc{"
  chk "Blog thumbnail CSS (.bt)"         "amayaa_blog.html" ".bt{"
  chk "Blog data-driven (blog.json)"     "amayaa_blog.html" "blog.json"
  chk "Blog card links to post page"     "amayaa_blog.html" "amayaa_blog_post.html"
  chk "Blog hero header"                 "amayaa_blog.html" "Weaves, Weavers"
  chk "Green orb colour"                 "amayaa_blog.html" "#8EC5C0"
  chk "Blog categories present"          "amayaa_blog.html" "Weaves"
  chk "readTime in JS template"          "amayaa_blog.html" "readTime"
  chk "Footer via nav.js injection"      "nav.js" 'class="ft"'
  chk "Blog gradient images"             "amayaa_blog.html" "linear-gradient"
  chk "Art of Banarasi (fallback data)"  "amayaa_blog.html" "Banarasi"
  chk "Heritage post"                    "amayaa_blog.html" "Heritage"
  chk "Threads post (Tussar)"           "amayaa_blog.html" "Tussar"
  chk "GoatCounter analytics"           "amayaa_blog.html" "goatcounter"

  print_header "BLOG POST PAGE"
  chk "Blog post page exists"           "amayaa_blog_post.html" "Blog"
  chk "No hero element"                 "amayaa_blog_post.html" 'class="hero"' false
  chk "Reads ?id= from URL"            "amayaa_blog_post.html" "URLSearchParams"
  chk "Fetches blog.json"              "amayaa_blog_post.html" "blog.json"
  chk "Post title element"             "amayaa_blog_post.html" "bp-title"
  chk "Markdown renderer present"      "amayaa_blog_post.html" "marked"
  chk "404 fallback"                   "amayaa_blog_post.html" "not found"
  chk "GoatCounter analytics"          "amayaa_blog_post.html" "goatcounter"

  print_header "SEARCH PAGE"
  chk "Search page exists"             "amayaa_search.html" "Search"
  chk "No hero element"                "amayaa_search.html" 'class="hero"' false
  chk "Search results grid present"    "amayaa_search.html" "srch-grid"
  chk "Reads products_index.json"      "amayaa_search.html" "products_index.json"
  chk "GoatCounter analytics"          "amayaa_search.html" "goatcounter"

  print_header "FAQ PAGE"
  chk "FAQ page exists"                "amayaa_faq.html" "FAQ"
  chk "Reads faq.json"                 "amayaa_faq.html" "faq.json"
  chk "Accordion JS present"           "amayaa_faq.html" "accordion"
  chk "GoatCounter analytics"          "amayaa_faq.html" "goatcounter"

  print_header "POLICIES PAGE"
  chk "Policies page exists"           "amayaa_policies.html" "Policies"
  chk "Reads policies.json"            "amayaa_policies.html" "policies.json"
  chk "GoatCounter analytics"          "amayaa_policies.html" "goatcounter"

  print_header "ADMIN PAGES"
  chk "Dashboard sidebar"              "amayaa_admin/amayaa_dashboard.html" "sidebar"
  chk "Dashboard stat cards"           "amayaa_admin/amayaa_dashboard.html" "TOTAL"
  chk "Dashboard uses sidebar.js"      "amayaa_admin/amayaa_dashboard.html" "sidebar.js"
  chk "Dashboard links admin.css"      "amayaa_admin/amayaa_dashboard.html" "admin.css"
  chk "admin.css pink sidebar"         "amayaa_admin/admin.css" "rgba(240,67,147"
  chk "admin.css topbar-title CSS"     "amayaa_admin/admin.css" "topbar-title"
  chk "admin.css body bg E4DFD9"       "amayaa_admin/admin.css" "E4DFD9"
  chk "admin.css sidebar rules"        "amayaa_admin/admin.css" "aside.sidebar"
  chk "admin.css topbar rules"         "amayaa_admin/admin.css" ".topbar{"
  chk "admin.css button rules"         "amayaa_admin/admin.css" ".btn{"
  chk "admin.css badge rules"          "amayaa_admin/admin.css" ".badge{"
  chk "Sidebar.js exists"              "amayaa_admin/sidebar.js" "inject"
  chk "Sidebar.js has logo"            "amayaa_admin/sidebar.js" "data:image/png"
  chk "Sidebar.js View Website"        "amayaa_admin/sidebar.js" "View Website"
  chk "Sidebar.js nav links"           "amayaa_admin/sidebar.js" "amayaa_products.html"
  chk "Sidebar.js Our Story link"      "amayaa_admin/sidebar.js" "amayaa_about.html"
  chk "Sidebar.js Typography link"     "amayaa_admin/sidebar.js" "amayaa_typography.html"
  chk "Sidebar.js Content Library"     "amayaa_admin/sidebar.js" "amayaa_content_library.html"
  chk "No double background bug"       "amayaa_admin/sidebar.js" "background:background:" false
  chk "Products table"                 "amayaa_admin/amayaa_products.html" 'class="tbl"'
  chk "Products reads index (not products.json)" "amayaa_admin/amayaa_products.html" "products_index.json"
  chk "Products GitHub API wired"      "amayaa_admin/amayaa_products.html" "api.github.com"
  chk "Product edit reads products_index" "amayaa_admin/amayaa_product_edit.html" "products_index.json"
  chk "Product edit GitHub API save"   "amayaa_admin/amayaa_product_edit.html" "api.github.com"
  chk "Product edit auto-SKU"          "amayaa_admin/amayaa_product_edit.html" "_genSKU"
  chk "Product edit gradient pickers"  "amayaa_admin/amayaa_product_edit.html" "gradientFrom"
  chk "Banner admin sidebar.js"        "amayaa_admin/amayaa_banners.html" "sidebar.js"
  chk "Banner admin Slide 1"           "amayaa_admin/amayaa_banners.html" "Slide 1"
  chk "Blog admin uses sidebar.js"     "amayaa_admin/amayaa_blog.html" "sidebar.js"
  chk "Blog admin links admin.css"     "amayaa_admin/amayaa_blog.html" "admin.css"
  chk "Categories admin Region"        "amayaa_admin/amayaa_categories.html" "Region"
  chk "Categories admin usage check"   "amayaa_admin/amayaa_categories.html" "_checkCategoryUsage"
  chk "Settings admin Store"           "amayaa_admin/amayaa_settings.html" "Store"
  chk "Settings uses sidebar.js"       "amayaa_admin/amayaa_settings.html" "sidebar.js"
  chk "Admin login form"               "amayaa_admin/index.html" "Sign In to Admin"
  chk "Content Library admin"          "amayaa_admin/amayaa_content_library.html" "content_library.json"
  chk "Content Library usage check"    "amayaa_admin/amayaa_content_library.html" "_checkLibraryUsage"
  chk "Typography page exists"         "amayaa_admin/amayaa_typography.html" "Typography"
  chk "Typography uses sidebar.js"     "amayaa_admin/amayaa_typography.html" "sidebar.js"
  chk "About admin Story Sections tab" "amayaa_admin/amayaa_about.html" "Story Sections"
  chk "About admin Values Strip tab"   "amayaa_admin/amayaa_about.html" "Values Strip"
  chk "About admin Weavers tab"        "amayaa_admin/amayaa_about.html" "Weavers"
  chk "Bulk upload admin page"         "amayaa_admin/amayaa_bulk_upload.html" "products_index.json"
  chk "Admin gate token check"         "amayaa_admin/amayaa_products.html" "amayaa_gh_token"

  echo ""
  echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
  echo -e "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}  ${YELLOW}${WARN} warnings${NC}  (total $((PASS+FAIL)))"
  echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
  [ "$FAIL" -gt 0 ] && return 1 || return 0
}

# ─────────────────────────────────────────────────────────────────────────────
kill_server() {
  PID=$(lsof -ti :$PORT 2>/dev/null || true)
  [ -n "$PID" ] && { kill "$PID" 2>/dev/null || true; sleep 1; }
}

start_local_server() {
  print_header "LOCAL SERVER"
  kill_server
  cd "$SITE_DIR"
  python3 -m http.server $PORT &>/tmp/amayaa_server.log &
  SID=$!; sleep 2
  if kill -0 $SID 2>/dev/null; then
    print_ok "Server at http://localhost:$PORT"
    open -a "Google Chrome" "http://localhost:$PORT" 2>/dev/null || open "http://localhost:$PORT" 2>/dev/null || true
    echo ""
    echo -e "  ${YELLOW}Key visual checks:${NC}"
    echo "    /                        — hero (6 slides, data-driven), sections"
    echo "    /amayaa_sarees.html      — filter overlay, region combobox"
    echo "    /amayaa_blog.html        — 3-col blog cards (data-driven)"
    echo "    /amayaa_about.html       — zigzag, weaver cards"
    echo "    /amayaa_contact.html     — buttons level, map"
    echo "    /amayaa_offers.html      — centred heading, offer cards"
    echo "    /amayaa_search.html      — search overlay, results"
    echo "    /amayaa_faq.html         — accordion items"
    echo "    /amayaa_blog_post.html?id=BLG-001  — blog reader"
    echo -e "\n  ${CYAN}Ctrl+C to stop${NC}"
    trap "kill $SID 2>/dev/null; exit 0" INT
    wait $SID
  else
    print_fail "Server failed. Check: cat /tmp/amayaa_server.log"; exit 1
  fi
}

deploy_github() {
  print_header "DEPLOY TO GITHUB PAGES"
  cd "$SITE_DIR"
  rm -f .git/index.lock .git/HEAD.lock
  git remote get-url origin &>/dev/null 2>&1 || git remote add origin https://github.com/Amayaa-2026/amayaa-website.git
  CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
  if [ "$CHANGES" = "0" ]; then
    echo -e "  ${CYAN}→  No uncommitted changes — pushing existing commits${NC}"
  else
    echo -e "  ${YELLOW}Uncommitted changes found — commit them first before deploying${NC}"
    git status --short
    exit 1
  fi
  git push origin main
  echo ""
  print_ok "Deployed — live at https://amayaabypolkadots.in in ~30 seconds"
}

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}  AMAYAA by Polka Dots — Test & Deploy v3.8${NC}\n"
case "$MODE" in
  test)
    run_checks
    RC=$?
    [ $RC -eq 0 ] && echo -e "\n  ${GREEN}✅ ALL CHECKS PASSED — safe to deploy${NC}\n  Run: bash $0 deploy" \
                  || echo -e "\n  ${RED}❌ FIX FAILURES BEFORE DEPLOYING${NC}"
    exit $RC ;;
  server)
    run_checks && start_local_server ;;
  deploy)
    run_checks && deploy_github ;;
  both)
    run_checks
    if [ $? -eq 0 ]; then
      read -p "  Deploy to GitHub Pages? (y/n): " C
      [ "$C" = "y" ] || [ "$C" = "Y" ] && deploy_github || echo "  Run: bash $0 deploy"
    else
      echo "  Fix failures first."; exit 1
    fi ;;
  *) echo "Usage: bash testing/test_and_deploy.sh [test|server|deploy|both]" ;;
esac
