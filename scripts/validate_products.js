#!/usr/bin/env node
/**
 * Amayaa Product Data Validator
 * Run before every git commit that touches data/products* or data/categories.json
 *
 * Usage:  node scripts/validate_products.js
 * Exit 0 = all clear, Exit 1 = issues found
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

/* ── Load data ─────────────────────────────────────────── */
const index    = load('data/products_index.json');
const cats     = load('data/categories.json');
const cl       = load('data/content_library.json');

/* ── Valid filter values ────────────────────────────────── */
const regionFilter  = cats.filters.find(f => f.id === 'region');
const fabricFilter  = cats.filters.find(f => f.id === 'fabric');
const occasionFilter = cats.filters.find(f => f.id === 'occasion');

const validTypes    = (regionFilter?.items  || []).map(i => (i.label || '').toLowerCase());
const validFabrics  = (fabricFilter?.items  || []).map(i => (i.label || '').toLowerCase());
const validOccasions = (occasionFilter?.items || []).map(i => ((i.deskLabel || i.label) || '').toLowerCase());

const bundleIds = new Set((cl.contentBundles || []).map(b => b.id));
// content_library.json uses: weaveStory, careSuggestions, description (singular/plural mixed)
const wsIds   = new Set((cl.weaveStory || cl.weaveStories || []).map(s => s.id));
const ciIds   = new Set((cl.careSuggestions || cl.careInstructions || []).map(c => c.id));
const descIds = new Set((cl.description || cl.descriptions || []).map(d => d.id));

/* ── CI substring match (same as _ci in sarees JS) ─────── */
function ci(a, b) {
  return String(a || '').toLowerCase().indexOf(String(b || '').toLowerCase()) > -1;
}

let errors   = 0;
let warnings = 0;

function err(pid, msg)  { console.error(`  ✗ [${pid}] ${msg}`); errors++;   }
function warn(pid, msg) { console.warn( `  ⚠ [${pid}] ${msg}`); warnings++; }

console.log(`\nAmayaa Product Validator — ${index.length} products\n`);

/* ── Check 1: every index entry has a detail file ──────── */
console.log('1. Index ↔ Detail file sync');
const detailDir = path.join(ROOT, 'data/products');
const detailFiles = new Set(
  fs.readdirSync(detailDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
);
const indexIds = new Set(index.map(p => p.id));

for (const p of index) {
  if (!detailFiles.has(p.id)) err(p.id, 'in index but NO detail file in data/products/');
}
for (const id of detailFiles) {
  if (!indexIds.has(id)) warn(id, 'has detail file but NOT in products_index.json');
}

/* ── Check 2: required fields ───────────────────────────── */
console.log('\n2. Required fields');
const REQUIRED_INDEX = ['id','name','type','region','fabric','colour','price','occasion','gradientFrom','gradientTo','thumbnail'];
const REQUIRED_DETAIL = ['id','name','type','region','fabric','occasion','price','gradientFrom','gradientTo','thumbnail','photos'];

for (const p of index) {
  for (const f of REQUIRED_INDEX) {
    const v = p[f];
    if (v === undefined || v === null || v === '') err(p.id, `index missing "${f}"`);
  }
  const detailPath = path.join(detailDir, p.id + '.json');
  if (!fs.existsSync(detailPath)) continue;
  const d = load(`data/products/${p.id}.json`);
  for (const f of REQUIRED_DETAIL) {
    const v = d[f];
    if (v === undefined || v === null || (Array.isArray(v) ? false : v === '')) {
      err(p.id, `detail missing "${f}"`);
    }
  }
  if (!d.price || d.price <= 0) err(p.id, `price must be > 0 (got ${d.price})`);
}

/* ── Check 3: type matches a region filter label ────────── */
console.log('\n3. Weave/Region filter coverage');
for (const p of index) {
  const t = (p.type || '').toLowerCase();
  const matched = validTypes.some(vt => t.indexOf(vt) > -1 || vt.indexOf(t) > -1);
  if (!matched) err(p.id, `type="${p.type}" matches no region filter chip. Add it to categories.json filters[region].items`);
}

/* ── Check 4: occasion values match filter chips ──────────── */
console.log('\n4. Occasion filter coverage');
for (const p of index) {
  const occs = Array.isArray(p.occasion) ? p.occasion : [p.occasion];
  for (const occ of occs) {
    const matched = validOccasions.some(vo => ci(occ, vo));
    if (!matched) warn(p.id, `occasion value "${occ}" matches no occasion filter chip`);
  }
}

/* ── Check 5: thumbnail is an ImageKit URL ──────────────── */
console.log('\n5. Thumbnail ImageKit URLs');
for (const p of index) {
  if (p.thumbnail && !p.thumbnail.startsWith('https://ik.imagekit.io/')) {
    err(p.id, `thumbnail is not an ImageKit URL: ${p.thumbnail}`);
  }
  if (!p.thumbnail) err(p.id, 'thumbnail is empty');
}

/* ── Check 6: content library refs ─────────────────────── */
console.log('\n6. Content library references');
for (const p of index) {
  if (!fs.existsSync(path.join(detailDir, p.id + '.json'))) continue;
  const d = load(`data/products/${p.id}.json`);
  const bid = d.contentBundleId;
  const wid = d.weaveStoryId;
  const cid = d.careInstructionId || d.careSuggestionId;

  if (bid) {
    if (!bundleIds.has(bid)) err(p.id, `contentBundleId="${bid}" not found in content_library.json`);
  } else {
    if (!wid) warn(p.id, 'no weaveStoryId or contentBundleId — drawer will show no weave story');
    else if (!wsIds.has(wid)) err(p.id, `weaveStoryId="${wid}" not found in content_library.json`);
    if (!cid) warn(p.id, 'no careInstructionId/careSuggestionId — drawer will show no care info');
    else if (!ciIds.has(cid)) err(p.id, `careInstructionId="${cid}" not found in content_library.json`);
  }
}

/* ── Summary ────────────────────────────────────────────── */
console.log('\n' + '─'.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed — safe to commit.\n');
  process.exit(0);
} else {
  console.log(`❌ ${errors} error(s), ${warnings} warning(s)`);
  if (errors > 0) {
    console.log('   Fix errors before committing. Warnings are informational.\n');
    process.exit(1);
  } else {
    console.log('   No blocking errors. Review warnings before shipping.\n');
    process.exit(0);
  }
}
