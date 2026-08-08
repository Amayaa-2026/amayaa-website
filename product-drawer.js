/* ============================================================
   Amayaa — Product Drawer  v4
   Header 10vh · Image 70vh · Swatches 20vh
   Right: Details 70vh · CTA 20vh
   Logo: Amayaa_Logo_-_circle-removebg-preview.png
   Dummy images: images/1.jpg, 2.jpg, 3.jpg, 4.jpg
   ============================================================ */
(
// Accordion toggle: − when open, + when closed; smooth scroll into view
function _pdAcc(h) {
  var a = h.parentElement;
  a.classList.toggle('pd-acc-open');
  h.querySelector('.pd-acc-icon').textContent = a.classList.contains('pd-acc-open') ? '−' : '+';
  if (a.classList.contains('pd-acc-open')) {
    setTimeout(function () { a.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
  }
}

function () {
  'use strict';

  /* ── Constants ──────────────────────────────────────────── */
  const LOGO_SRC     = 'Amayaa_Logo_-_circle-removebg-preview.png';
  const DUMMY_IMGS   = ['images/1.jpg','images/2.jpg','images/3.jpg','images/4.jpg'];
  const DUMMY_LABELS = ['Look 1','Look 2','Look 3','Look 4'];
  const WA_NUMBER    = '919583946000';
  const CALL_NUMBER  = '+91 95839 46000';
  const WISHLIST_KEY = 'amayaa_wishlist';

  /* ── State ──────────────────────────────────────────────── */
  let _drawer    = null;
  let _backdrop  = null;
  let _toast     = null;
  let _currentId = null;
  let _isOpen    = false;
  let _wishlist  = [];
  let _autoTimer = null;
  let _viewIdx   = 0;
  let _swatches  = [];  /* [{src, label, isImg}] */

  /* ── Public API ─────────────────────────────────────────── */
  window.ProductDrawer = { open, close };

  /* ── Open ───────────────────────────────────────────────── */
  function open(productId) {
    if (!productId) return;
    _build();
    _currentId = productId;
    _isOpen    = true;
    _viewIdx   = 0;
    _stopAuto();
    _renderSkeleton();

    requestAnimationFrame(() => {
      _backdrop.classList.add('pd-open');
      _drawer.classList.add('pd-open');
    });
    _lockScroll();

    /* deep-link */
    try {
      const u = new URL(location.href);
      u.searchParams.set('id', productId);
      history.replaceState(null, '', u.toString());
    } catch(e) {}

    /* fetch product */
    fetch('data/products/' + productId + '.json')
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(p  => { if (_currentId === productId) _render(p); })
      .catch(() => {
        if (_currentId !== productId) return;
        _drawer.querySelector('#pd-body-2col').innerHTML =
          `<div class="pd-error">
            <div class="pd-error-msg">Couldn't load product details.</div>
            <span class="pd-error-link" onclick="ProductDrawer.close()">Close</span>
          </div>`;
      });
  }

  /* ── Close ──────────────────────────────────────────────── */
  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    _stopAuto();
    _backdrop.classList.remove('pd-open');
    _drawer.classList.remove('pd-open');
    _unlockScroll();
    try {
      const u = new URL(location.href);
      u.searchParams.delete('id');
      history.replaceState(null, '', u.toString());
    } catch(e) {}
  }

  /* ── Build DOM (once) ───────────────────────────────────── */
  function _build() {
    if (_drawer) return;

    /* Backdrop */
    _backdrop = document.createElement('div');
    _backdrop.className = 'pd-backdrop';
    _backdrop.addEventListener('click', close);
    document.body.appendChild(_backdrop);

    /* Toast */
    _toast = document.createElement('div');
    _toast.className = 'pd-toast';
    document.body.appendChild(_toast);

    /* Drawer */
    _drawer = document.createElement('div');
    _drawer.className = 'pd-drawer';
    _drawer.setAttribute('role', 'dialog');
    _drawer.setAttribute('aria-modal', 'true');
    _drawer.setAttribute('aria-label', 'Product details');
    _drawer.innerHTML = `
      <!-- HEADER 10vh -->
      <div class="pd-header">
        <!-- LEFT: logo + company name -->
        <div class="pd-header-brand">
          <img class="pd-header-logo" src="${LOGO_SRC}" alt="Amayaa logo">
          <div class="pd-wordmark">
            <span class="pd-wordmark-main">Amayaa</span>
            <span class="pd-wordmark-sub">by Polka Dots</span>
          </div>
        </div>
        <!-- RIGHT: breadcrumb (search results / product name) + close -->
        <div class="pd-header-right">
          <div class="pd-breadcrumb">
            <span class="pd-bc-upper">Search results</span>
            <span class="pd-bc-title" id="pd-bc-name">Product detail</span>
          </div>
          <button class="pd-close-btn" aria-label="Close">&times;</button>
        </div>
      </div>
      <!-- BODY -->
      <div class="pd-body-2col" id="pd-body-2col">
        <!-- skeleton shown until render() replaces this -->
        <div style="flex:1;padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div class="pd-skel" style="height:70%;border-radius:3px;"></div>
          <div style="display:flex;gap:4px;height:18%;">
            <div class="pd-skel" style="flex:1;"></div>
            <div class="pd-skel" style="flex:1;"></div>
            <div class="pd-skel" style="flex:1;"></div>
            <div class="pd-skel" style="flex:1;"></div>
          </div>
        </div>
        <div style="flex:1;padding:22px;display:flex;flex-direction:column;gap:14px;">
          <div class="pd-skel" style="height:14px;width:60%;"></div>
          <div class="pd-skel" style="height:32px;width:90%;"></div>
          <div class="pd-skel" style="height:28px;width:40%;"></div>
          <div class="pd-skel" style="height:180px;"></div>
          <div class="pd-skel" style="height:80px;"></div>
        </div>
      </div>`;

    _drawer.querySelector('.pd-close-btn').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && _isOpen) close(); });
    document.body.appendChild(_drawer);

    try { _wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch(e) { _wishlist = []; }
  }

  /* ── Skeleton placeholder ───────────────────────────────── */
  function _renderSkeleton() {
    /* breadcrumb reset */
    const bcName = _drawer.querySelector('#pd-bc-name');
    if (bcName) bcName.textContent = 'Loading…';
  }

  /* ── Full render ────────────────────────────────────────── */
  function _render(p) {
    /* Update breadcrumb */
    const bcName = _drawer.querySelector('#pd-bc-name');
    if (bcName) bcName.textContent = p.name || 'Product detail';

    /* Build swatches array */
    const photos = (p.photos || []).filter(Boolean);
    if (photos.length >= 4) {
      _swatches = photos.slice(0, 4).map((src, i) => ({ src, label: 'Look ' + (i+1), isImg: true }));
    } else if (photos.length > 0) {
      /* pad with gradient */
      _swatches = photos.map((src, i) => ({ src, label: 'Look ' + (i+1), isImg: true }));
      while (_swatches.length < 4) {
        _swatches.push({ src: null, label: DUMMY_LABELS[_swatches.length] || '', isImg: false });
      }
    } else {
      /* Use dummy images as thumbnails */
      _swatches = DUMMY_IMGS.map((src, i) => ({ src, label: DUMMY_LABELS[i], isImg: true }));
    }

    /* Badges */
    const badges = _buildBadges(p);

    /* Specs */
    const specs = _buildSpecs(p);

    /* Price HTML */
    const priceHtml = p.originalPrice
      ? `<span class="pd-price">₹${_fmt(p.price)}</span>
         <span class="pd-orig-price">₹${_fmt(p.originalPrice)}</span>
         <span class="pd-savings">Save ₹${_fmt(p.originalPrice - p.price)}</span>`
      : `<span class="pd-price">₹${_fmt(p.price)}</span>`;

    /* GI line */
    const giLine = p.giTagged || (p.tags||[]).some(t => t.toLowerCase().includes('gi'))
      ? `<div class="pd-gi-line">✦ GI Tagged — Government of India Certified</div>` : '';

    /* Weave facts */
    const weaveFacts = p.weavingDays
      ? `<div class="pd-weave-facts">
           <div class="pd-wf"><div class="pd-wf-num">${p.weavingDays.replace('–','-')}</div><div class="pd-wf-label">Days to Weave</div></div>
           <div class="pd-wf"><div class="pd-wf-num">7</div><div class="pd-wf-label">Generations</div></div>
           <div class="pd-wf"><div class="pd-wf-num">100%</div><div class="pd-wf-label">Handloom</div></div>
         </div>` : '';

    /* WA message */
    const waMsg = encodeURIComponent(`Hello! I'm interested in: ${p.name} (₹${_fmt(p.price)}). Please share more details.`);

    const wished = _wishlist.includes(p.id);

    /* Build full body HTML */
    _drawer.querySelector('#pd-body-2col').innerHTML = `
      <!-- LEFT COLUMN -->
      <div class="pd-col-left">
        <!-- Image zone 70vh -->
        <div class="pd-img-zone" id="pd-img-zone">
          <div class="pd-img-inner" id="pd-img-inner"></div>
          <div class="pd-badge-row">${badges}</div>
          <button class="pd-arr pd-arr-left" id="pd-arr-left" aria-label="Previous">&#8249;</button>
          <button class="pd-arr pd-arr-right" id="pd-arr-right" aria-label="Next">&#8250;</button>
        </div>
        <!-- Swatch strip 20vh -->
        <div class="pd-swatches-strip" id="pd-swatches-strip"></div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="pd-col-right">
        <!-- INFO STRIP: lean, fixed — type / title / price / GI only -->
        <div class="pd-info-strip">
          <div class="pd-type-line">${_esc(p.type || p.region || '')}</div>
          <div class="pd-title">${_esc(p.name)}</div>
          <div class="pd-price-row">${priceHtml}</div>
          ${giLine}
        </div>

        <!-- ACCORDION ZONE: flex:1 — specs pill grid + 3 accordion headers always visible -->
        <div class="pd-acc-zone" id="pd-col3">
          <div class="pd-specs">${specs}</div>
          ${p.shortDescription ? `<div class="pd-short-desc">${_esc(p.shortDescription)}</div>` : ''}
          ${p.description ? `<div class="pd-acc" id="pd-acc-desc">
            <div class="pd-acc-header" onclick="_pdAcc(this)">
              <span class="pd-acc-label">The Saree</span>
              <span class="pd-acc-icon">+</span>
            </div>
            <div class="pd-acc-body">${_esc(p.description)}</div>
          </div>` : '<div class="pd-acc" id="pd-acc-desc"><div class="pd-acc-header" onclick=\"_pdAcc(this)\"><span class="pd-acc-label">The Saree</span><span class="pd-acc-icon">+</span></div><div class="pd-acc-body">Details about this saree coming soon.</div></div>'}
          ${p.weaveStory ? `<div class="pd-acc" id="pd-acc-story">
            <div class="pd-acc-header" onclick="_pdAcc(this)">
              <span class="pd-acc-label">Weave Story</span>
              <span class="pd-acc-icon">+</span>
            </div>
            <div class="pd-acc-body">${_esc(p.weaveStory)}${weaveFacts}</div>
          </div>` : '<div class="pd-acc" id="pd-acc-story"><div class="pd-acc-header" onclick=\"_pdAcc(this)\"><span class="pd-acc-label">Weave Story</span><span class="pd-acc-icon">+</span></div><div class="pd-acc-body">Weave story coming soon.</div></div>'}
          ${p.careInstructions ? `<div class="pd-acc" id="pd-acc-care">
            <div class="pd-acc-header" onclick="_pdAcc(this)">
              <span class="pd-acc-label">Care Guide</span>
              <span class="pd-acc-icon">+</span>
            </div>
            <div class="pd-acc-body">${_esc(p.careInstructions)}</div>
          </div>` : '<div class="pd-acc" id="pd-acc-care"><div class="pd-acc-header" onclick=\"_pdAcc(this)\"><span class="pd-acc-label">Care Guide</span><span class="pd-acc-icon">+</span></div><div class="pd-acc-body">Care instructions coming soon.</div></div>'}
        </div>

        <!-- CTA Panel: WA / Call / Wishlist+Share -->
        <div class="pd-cta-panel">
          <!-- Row 1: WhatsApp (full width green) -->
          <a class="pd-btn-wa"
             href="https://wa.me/${WA_NUMBER}?text=${waMsg}"
             target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.534 5.856L.057 23.737a.5.5 0 0 0 .61.62l6.002-1.567A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.074-1.417l-.364-.214-3.77.988.999-3.672-.236-.376A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Enquire on WhatsApp
          </a>
          <!-- Row 2: Call Us (full width bordered) -->
          <a class="pd-btn-call" href="tel:${CALL_NUMBER}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call Us
          </a>
          <!-- Row 3: Wishlist | Share (50/50) -->
          <div class="pd-cta-row">
            <button class="pd-btn-wish${wished ? ' pd-wished' : ''}" id="pd-wish-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${wished?'#8B1A4A':'none'}" stroke="#8B1A4A" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${wished ? 'Saved' : 'Wishlist'}
            </button>
            <button class="pd-btn-share" id="pd-share-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>`;

    /* Wire swatch strip + viewer */
    _renderSwatches();
    _updateView(0);

    /* Arrow buttons */
    _drawer.querySelector('#pd-arr-left').addEventListener('click', () => { _stopAuto(); _updateView((_viewIdx - 1 + _swatches.length) % _swatches.length); });
    _drawer.querySelector('#pd-arr-right').addEventListener('click', () => { _stopAuto(); _updateView((_viewIdx + 1) % _swatches.length); });

    /* Wishlist */
    _drawer.querySelector('#pd-wish-btn').addEventListener('click', () => _toggleWish(p));

    /* Share */
    _drawer.querySelector('#pd-share-btn').addEventListener('click', () => _share(p));

    /* Auto-advance every 5s */
    _startAuto();
  }

  /* ── Render swatch strip ────────────────────────────────── */
  function _renderSwatches() {
    const strip = _drawer.querySelector('#pd-swatches-strip');
    strip.innerHTML = '';
    _swatches.forEach((sw, i) => {
      const el = document.createElement('div');
      el.className = 'pd-swatch-item' + (i === 0 ? ' pd-sw-active' : '');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', sw.label);
      if (sw.isImg && sw.src) {
        el.innerHTML = `<img src="${sw.src}" alt="${sw.label}" loading="lazy">
                        <div class="pd-swatch-label">${_esc(sw.label)}</div>`;
      } else {
        el.innerHTML = `<div class="pd-swatch-gradient" style="background:${sw.gradient||'#ccc'}"></div>
                        <div class="pd-swatch-label">${_esc(sw.label)}</div>`;
      }
      el.addEventListener('click', () => { _stopAuto(); _updateView(i); });
      el.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); _stopAuto(); _updateView(i); }});
      strip.appendChild(el);
    });
  }

  /* ── Update viewer + active swatch ─────────────────────── */
  function _updateView(idx) {
    _viewIdx = idx;
    const sw = _swatches[idx];
    const inner = _drawer.querySelector('#pd-img-inner');

    if (sw.isImg && sw.src) {
      inner.innerHTML = `<img class="pd-img-display" src="${sw.src}" alt="${_esc(sw.label)}" loading="lazy">`;
    } else {
      inner.innerHTML = `<div class="pd-img-gradient" style="background:${sw.gradient||'linear-gradient(160deg,#4A1060,#9B7DC4)'}">
                           <div class="pd-grad-label">${_esc(sw.label)}</div>
                         </div>`;
    }

    /* Update active swatch */
    _drawer.querySelectorAll('.pd-swatch-item').forEach((el, i) => {
      el.classList.toggle('pd-sw-active', i === idx);
    });

    /* Hide arrows when only 1 swatch */
    const showArrows = _swatches.length > 1;
    const arrL = _drawer.querySelector('#pd-arr-left');
    const arrR = _drawer.querySelector('#pd-arr-right');
    if (arrL) showArrows ? arrL.removeAttribute('hidden') : arrL.setAttribute('hidden','');
    if (arrR) showArrows ? arrR.removeAttribute('hidden') : arrR.setAttribute('hidden','');
  }

  /* ── Auto-advance ───────────────────────────────────────── */
  function _startAuto() {
    if (_swatches.length <= 1) return;
    _autoTimer = setInterval(() => {
      if (_isOpen) _updateView((_viewIdx + 1) % _swatches.length);
    }, 4500);
  }
  function _stopAuto() {
    clearInterval(_autoTimer);
    _autoTimer = null;
  }

  /* ── Wishlist ───────────────────────────────────────────── */
  function _toggleWish(p) {
    const btn = _drawer.querySelector('#pd-wish-btn');
    const idx = _wishlist.indexOf(p.id);
    if (idx === -1) {
      _wishlist.push(p.id);
      btn.classList.add('pd-wished');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#8B1A4A" stroke="#8B1A4A" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved`;
      _showToast('Added to wishlist ♥');
    } else {
      _wishlist.splice(idx, 1);
      btn.classList.remove('pd-wished');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A4A" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Wishlist`;
      _showToast('Removed from wishlist');
    }
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(_wishlist)); } catch(e) {}
  }

  /* ── Share ──────────────────────────────────────────────── */
  function _share(p) {
    const url = location.href;
    if (navigator.share) {
      navigator.share({ title: p.name, text: `Check out this ${p.name} on Amayaa`, url }).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(url).then(() => _showToast('Link copied!')).catch(() => _showToast('Copy the URL to share'));
    }
  }

  /* ── Toast ──────────────────────────────────────────────── */
  function _showToast(msg) {
    if (!_toast) return;
    _toast.textContent = msg;
    _toast.classList.add('pd-show');
    setTimeout(() => _toast.classList.remove('pd-show'), 2200);
  }

  /* ── Build badge HTML ───────────────────────────────────── */
  function _buildBadges(p) {
    const out = [];
    (p.badges || []).forEach(b => {
      if (b === 'new')      out.push(`<span class="pd-badge pd-badge-new">New</span>`);
      if (b === 'offer')    out.push(`<span class="pd-badge pd-badge-offer">Special Offer</span>`);
      if (b === 'featured') out.push(`<span class="pd-badge pd-badge-feat">Featured</span>`);
    });
    if (p.giTagged || (p.tags||[]).some(t => t.toLowerCase().includes('gi')))
      out.push(`<span class="pd-badge pd-badge-gi">✦ GI Tagged</span>`);
    if (p.status === 'sold_out')
      out.push(`<span class="pd-badge pd-badge-sold">Sold Out</span>`);
    return out.join('');
  }

  /* ── Build specs HTML ───────────────────────────────────── */
  function _buildSpecs(p) {
    const rows = [];
    const add = (label, val) => { if (val) rows.push(`<div class="pd-spec"><span class="pd-spec-label">${label}</span><span class="pd-spec-val">${_esc(String(val))}</span></div>`); };
    add('Region',  p.region);
    add('Fabric',  p.fabric);
    add('Colour',  p.colour);
    add('Weave',   p.weaveType);
    add('Length',  p.length);
    add('Blouse',  p.blousePiece || (p.blouseIncluded ? 'Included' : null));
    if ((p.occasion||[]).length) add('Occasion', (p.occasion||[]).map(o => o.charAt(0).toUpperCase()+o.slice(1)).join(', '));
    return rows.join('');
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function _fmt(n) { return Number(n).toLocaleString('en-IN'); }
  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _lockScroll()   { document.body.style.overflow = 'hidden'; }
  function _unlockScroll() { document.body.style.overflow = ''; }

  /* ── Deep-link on load ──────────────────────────────────── */
  function _checkDeepLink() {
    try {
      const id = new URL(location.href).searchParams.get('id');
      if (id) setTimeout(() => open(id), 200);
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _checkDeepLink);
  } else {
    _checkDeepLink();
  }

})();
