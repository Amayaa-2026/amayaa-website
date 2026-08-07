/* ============================================================
   Amayaa — Product Drawer Overlay  v3
   product-drawer.js
   2-col layout: image+swatches (col1 50%) | details+CTA (col2 50%)
   4 swatches always visible, active highlighted
   Usage: ProductDrawer.open('AMY-BAN-001')
   ============================================================ */

(function () {
  'use strict';

  /* ── State ───────────────────────────────────────────────── */
  let _drawer   = null;
  let _backdrop = null;
  let _toast    = null;
  let _isOpen   = false;
  let _currentId = null;
  let _wishlist  = [];
  let _swatchIdx = 0;
  let _photos    = [];
  let _autoTimer = null;

  /* ── Fixed gradient swatches (empty-photo state) ─────────── */
  const SWATCHES = [
    { bg: 'linear-gradient(135deg,#C490B8,#7A2050)', label: 'Deep Plum'   },
    { bg: 'linear-gradient(135deg,#E8C87A,#C49A32)', label: 'Warm Gold'   },
    { bg: 'linear-gradient(135deg,#F0C0CC,#D4607A)', label: 'Rose Pink'   },
    { bg: 'linear-gradient(135deg,#98A8D0,#3A4E8C)', label: 'Indigo Blue' },
  ];

  /* ── Breadcrumb ───────────────────────────────────────────── */
  function _getBreadcrumb() {
    const path = location.pathname;
    if (path.includes('amayaa_search'))  return 'Search results &rsaquo; Product detail';
    if (path.includes('amayaa_sarees'))  return 'Sarees &rsaquo; Product detail';
    if (path.includes('index') || path.endsWith('/')) return 'Home &rsaquo; Product detail';
    return 'Amayaa &rsaquo; Product detail';
  }

  /* ── SVG icons ────────────────────────────────────────────── */
  const SVG_WA = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
  const SVG_PHONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>`;
  const SVG_HEART_EMPTY = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
  const SVG_HEART_FULL  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#8B1A4A" stroke="#8B1A4A" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
  const SVG_SHARE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

  /* ── Build DOM shell ──────────────────────────────────────── */
  function _build() {
    if (_drawer) return;

    _backdrop = document.createElement('div');
    _backdrop.className = 'pd-backdrop';
    _backdrop.addEventListener('click', close);
    document.body.appendChild(_backdrop);

    _toast = document.createElement('div');
    _toast.className = 'pd-toast';
    _toast.textContent = 'Link copied to clipboard';
    document.body.appendChild(_toast);

    _drawer = document.createElement('div');
    _drawer.className = 'pd-drawer';
    _drawer.setAttribute('role', 'dialog');
    _drawer.setAttribute('aria-modal', 'true');
    _drawer.setAttribute('aria-label', 'Product detail');

    _drawer.innerHTML = `
      <div class="pd-header">
        <div class="pd-breadcrumb">${_getBreadcrumb()}</div>
        <div class="pd-header-right">
          <div class="pd-logo">Amayaa<small>by Polka Dots</small></div>
          <button class="pd-close-btn" aria-label="Close">&times;</button>
        </div>
      </div>
      <div class="pd-body-2col" id="pd-body-2col">
        <!-- filled by _renderSkeleton() / _render() -->
      </div>`;

    _drawer.querySelector('.pd-close-btn').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && _isOpen) close(); });
    document.body.appendChild(_drawer);

    try { _wishlist = JSON.parse(localStorage.getItem('amayaa_wishlist') || '[]'); } catch(e) { _wishlist = []; }
  }

  /* ── Skeleton ─────────────────────────────────────────────── */
  function _renderSkeleton() {
    const body = _drawer.querySelector('#pd-body-2col');
    body.innerHTML = `
      <div class="pd-col-left">
        <div class="pd-img-zone" style="background:linear-gradient(160deg,#EAE0F5,#F5EEF8);"></div>
        <div class="pd-swatches-strip">
          ${SWATCHES.map(s => `<div class="pd-swatch-item" style="background:${s.bg};opacity:.4;"></div>`).join('')}
        </div>
      </div>
      <div class="pd-col-right">
        <div class="pd-col3">
          <div class="pd-skeleton">
            <div class="pd-skel" style="height:14px;width:50%"></div>
            <div class="pd-skel" style="height:28px;width:80%"></div>
            <div class="pd-skel" style="height:32px;width:38%"></div>
            <div class="pd-skel" style="height:110px"></div>
            <div class="pd-skel" style="height:80px"></div>
            <div class="pd-skel" style="height:46px"></div>
            <div class="pd-skel" style="height:46px"></div>
          </div>
        </div>
        <div class="pd-cta-panel" style="opacity:.3;">
          <div class="pd-skel" style="height:30px;border-radius:7px"></div>
          <div class="pd-skel" style="height:24px;border-radius:7px"></div>
        </div>
      </div>`;
  }

  /* ── Render product ───────────────────────────────────────── */
  function _render(p) {
    _photos    = (p.photos && p.photos.length) ? p.photos : [];
    _swatchIdx = 0;
    _stopAuto();

    const wished = _wishlist.includes(p.id);

    /* Badges */
    const badges = (p.badges || []).map(b => ({
      new: `<span class="pd-badge pd-badge-new">New</span>`,
      offer: `<span class="pd-badge pd-badge-offer">Offer</span>`,
      featured: `<span class="pd-badge pd-badge-feat">Featured</span>`,
    }[b] || '')).join('') + (p.giTagged ? `<span class="pd-badge pd-badge-gi">GI</span>` : '');

    /* Price */
    const priceHtml = p.originalPrice
      ? `<span class="pd-price">₹${p.price.toLocaleString('en-IN')}</span>
         <span class="pd-orig-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>
         <span class="pd-savings">Save ₹${(p.originalPrice - p.price).toLocaleString('en-IN')}</span>`
      : `<span class="pd-price">₹${p.price.toLocaleString('en-IN')}</span>`;

    /* Specs — single column */
    const occasion = Array.isArray(p.occasion) ? p.occasion.join(', ') : (p.occasion || '—');
    const specs = [
      { label: 'Fabric',    val: p.fabric      || '—' },
      { label: 'Weave',     val: p.weaveType   || p.type || '—' },
      { label: 'Length',    val: p.length      || '6.3 m' },
      { label: 'Blouse',    val: p.blousePiece || (p.blouseIncluded ? 'Included' : 'Not included') },
      { label: 'Occasion',  val: occasion },
      { label: 'Colour',    val: p.colour      || '—' },
      { label: 'Region',    val: p.region      || '—' },
    ].map(s => `<div class="pd-spec"><div class="pd-spec-label">${s.label}</div><div class="pd-spec-val">${s.val}</div></div>`).join('');

    /* Weave story */
    const weaveBody = `<p>${p.weaveStory || 'Weave story coming soon.'}</p>
      <div class="pd-weave-facts">
        <div class="pd-wf"><div class="pd-wf-num">${p.weavingDays || '—'}</div><div class="pd-wf-label">Days to weave</div></div>
        <div class="pd-wf"><div class="pd-wf-num">GI</div><div class="pd-wf-label">${p.giTagged ? 'Certified' : 'Not tagged'}</div></div>
        <div class="pd-wf"><div class="pd-wf-num">${p.region ? p.region.split(',')[0] : '—'}</div><div class="pd-wf-label">Region</div></div>
        <div class="pd-wf"><div class="pd-wf-num">2000+</div><div class="pd-wf-label">Yrs tradition</div></div>
      </div>`;

    /* Arrows visibility */
    const total = _photos.length || 4;
    const arrowHidden = total < 2 ? ' hidden' : '';

    /* WhatsApp URL */
    const waText = encodeURIComponent(`Hello! I am interested in ${p.name} (${p.id})`);
    const waUrl  = `https://wa.me/919583946000?text=${waText}`;

    /* Build the 2-col body */
    const body = _drawer.querySelector('#pd-body-2col');
    body.innerHTML = `
      <div class="pd-col-left">
        <div class="pd-img-zone" id="pd-img-zone">
          <div class="pd-badge-row">${badges}</div>
          <div class="pd-img-inner" id="pd-img-inner"></div>
          <button class="pd-arr pd-arr-left"  id="pd-arr-left"  aria-label="Previous"${arrowHidden}>&#8249;</button>
          <button class="pd-arr pd-arr-right" id="pd-arr-right" aria-label="Next"${arrowHidden}>&#8250;</button>
        </div>
        <div class="pd-swatches-strip" id="pd-swatches-strip"></div>
      </div>
      <div class="pd-col-right">
        <div class="pd-col3">
          <div class="pd-type-line">${p.type || ''} · ${p.region || ''} · ${p.id}</div>
          <div class="pd-title">${p.name}</div>
          <div class="pd-price-row">${priceHtml}</div>
          <div class="pd-specs">${specs}</div>
          <div class="pd-short-desc">${p.shortDescription || p.description || ''}</div>
          <div class="pd-acc">
            <div class="pd-acc-header"><span class="pd-acc-label">Weave story</span><span class="pd-acc-icon">+</span></div>
            <div class="pd-acc-body">${weaveBody}</div>
          </div>
          <div class="pd-acc">
            <div class="pd-acc-header"><span class="pd-acc-label">Care instructions</span><span class="pd-acc-icon">+</span></div>
            <div class="pd-acc-body">${p.careInstructions || 'Dry clean recommended. Store folded in muslin cloth away from direct sunlight.'}</div>
          </div>
        </div>
        <div class="pd-cta-panel">
          <a href="${waUrl}" class="pd-btn-wa" target="_blank" rel="noopener">${SVG_WA} Enquire on WhatsApp</a>
          <a href="tel:+919583946000" class="pd-btn-call">${SVG_PHONE} Call Us — +91 95839 46000</a>
          <div class="pd-cta-row">
            <button class="pd-btn-wish${wished ? ' pd-wished' : ''}" id="pd-wish-btn">
              ${wished ? SVG_HEART_FULL : SVG_HEART_EMPTY}
              <span>${wished ? 'Saved' : 'Save to wishlist'}</span>
            </button>
            <button class="pd-btn-share" id="pd-share-btn" aria-label="Share">${SVG_SHARE}</button>
          </div>
        </div>
      </div>`;

    /* Initial render */
    _updateView(0);

    /* Arrow events */
    _drawer.querySelector('#pd-arr-left').addEventListener('click',  () => _navigate(-1));
    _drawer.querySelector('#pd-arr-right').addEventListener('click', () => _navigate(1));

    /* Accordion */
    _drawer.querySelectorAll('.pd-acc-header').forEach(h =>
      h.addEventListener('click', () => h.closest('.pd-acc').classList.toggle('pd-acc-open'))
    );

    /* Wishlist */
    const wishBtn = _drawer.querySelector('#pd-wish-btn');
    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        const idx = _wishlist.indexOf(p.id);
        if (idx === -1) {
          _wishlist.push(p.id);
          wishBtn.classList.add('pd-wished');
          wishBtn.innerHTML = SVG_HEART_FULL + '<span>Saved</span>';
        } else {
          _wishlist.splice(idx, 1);
          wishBtn.classList.remove('pd-wished');
          wishBtn.innerHTML = SVG_HEART_EMPTY + '<span>Save to wishlist</span>';
        }
        try { localStorage.setItem('amayaa_wishlist', JSON.stringify(_wishlist)); } catch(e) {}
      });
    }

    /* Share */
    const shareBtn = _drawer.querySelector('#pd-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const url = location.origin + location.pathname + '?id=' + p.id;
        navigator.clipboard.writeText(url).then(_showToast).catch(() => prompt('Copy link:', url));
      });
    }

    _startAuto();
  }

  /* ── Update main viewer + swatch highlight ───────────────── */
  function _updateView(idx) {
    const total = _photos.length || 4;
    _swatchIdx  = ((idx % total) + total) % total;

    const imgInner = _drawer.querySelector('#pd-img-inner');
    const strip    = _drawer.querySelector('#pd-swatches-strip');
    if (!imgInner || !strip) return;

    /* Main viewer */
    if (_photos.length) {
      imgInner.innerHTML = `<img class="pd-img-display" src="${_photos[_swatchIdx]}" alt="Product view ${_swatchIdx + 1}" loading="lazy">`;
    } else {
      const s = SWATCHES[_swatchIdx];
      imgInner.innerHTML = `
        <div class="pd-img-swatch-main" style="background:${s.bg};">
          <div class="pd-swatch-block" style="background:rgba(255,255,255,.15);"></div>
          <div class="pd-swatch-label-main">${s.label}</div>
        </div>`;
    }

    /* Swatch strip — all 4 visible, active highlighted */
    const items = _photos.length ? _photos : SWATCHES.map(s => s.bg);
    strip.innerHTML = (_photos.length ? _photos : SWATCHES).map((item, i) => {
      const active = i === _swatchIdx ? ' pd-sw-active' : '';
      if (_photos.length) {
        return `<div class="pd-swatch-item${active}" data-idx="${i}">
          <img src="${item}" alt="View ${i+1}" loading="lazy">
          ${SWATCHES[i] ? `<span class="pd-swatch-label">${SWATCHES[i].label}</span>` : ''}
        </div>`;
      } else {
        return `<div class="pd-swatch-item${active}" data-idx="${i}" style="background:${item.bg};">
          <span class="pd-swatch-label">${item.label}</span>
        </div>`;
      }
    }).join('');

    /* Wire swatch clicks */
    strip.querySelectorAll('.pd-swatch-item').forEach(el => {
      el.addEventListener('click', () => {
        _stopAuto();
        _updateView(parseInt(el.dataset.idx, 10));
        _startAuto();
      });
    });
  }

  /* ── Navigate ─────────────────────────────────────────────── */
  function _navigate(delta) {
    _stopAuto();
    _updateView(_swatchIdx + delta);
    _startAuto();
  }

  /* ── Auto-scroll ──────────────────────────────────────────── */
  function _startAuto() {
    _stopAuto();
    const total = _photos.length || 4;
    if (total < 2) return;
    _autoTimer = setInterval(() => _updateView(_swatchIdx + 1), 4000);
  }
  function _stopAuto() {
    if (_autoTimer) { clearInterval(_autoTimer); _autoTimer = null; }
  }

  /* ── Toast ────────────────────────────────────────────────── */
  function _showToast() {
    _toast.classList.add('pd-show');
    setTimeout(() => _toast.classList.remove('pd-show'), 2200);
  }

  /* ── Scroll lock ──────────────────────────────────────────── */
  function _lockScroll()   { document.body.style.overflow = 'hidden'; }
  function _unlockScroll() { document.body.style.overflow = '';       }

  /* ── Public: open ─────────────────────────────────────────── */
  function open(productId) {
    if (!productId) return;
    _build();
    _currentId = productId;
    _isOpen    = true;
    _stopAuto();
    _renderSkeleton();

    requestAnimationFrame(() => {
      _backdrop.classList.add('pd-open');
      _drawer.classList.add('pd-open');
    });
    _lockScroll();

    const url = new URL(location.href);
    url.searchParams.set('id', productId);
    history.pushState({ pdId: productId }, '', url.toString());

    fetch('data/products/' + productId + '.json')
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(p  => { if (_currentId === productId) _render(p); })
      .catch(() => {
        if (_currentId !== productId) return;
        const body = _drawer.querySelector('#pd-body-2col');
        body.innerHTML = `
          <div class="pd-col-left" style="background:linear-gradient(160deg,#EAE0F5,#F5EEF8);"></div>
          <div class="pd-col-right">
            <div class="pd-col3">
              <div class="pd-error">
                <p class="pd-error-msg">We could not load this product.</p>
                <span class="pd-error-link" onclick="ProductDrawer.close()">Back to search</span>
              </div>
            </div>
          </div>`;
      });
  }

  /* ── Public: close ────────────────────────────────────────── */
  function close() {
    if (!_isOpen) return;
    _isOpen    = false;
    _currentId = null;
    _stopAuto();
    _backdrop.classList.remove('pd-open');
    _drawer.classList.remove('pd-open');
    _unlockScroll();
    const url = new URL(location.href);
    url.searchParams.delete('id');
    history.pushState({}, '', url.toString());
  }

  /* ── Deep-link ────────────────────────────────────────────── */
  function _checkDeepLink() {
    const id = new URLSearchParams(location.search).get('id');
    if (id) open(id);
  }

  window.addEventListener('popstate', e => {
    if (e.state && e.state.pdId) open(e.state.pdId);
    else if (_isOpen) close();
  });

  window.ProductDrawer = { open, close };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _checkDeepLink);
  } else {
    _checkDeepLink();
  }

}());
