/* ============================================================
   Amayaa — Product Drawer Overlay
   product-drawer.js
   Usage: ProductDrawer.open('AMY-BAN-001')
   Include on any page:
     <link rel="stylesheet" href="product-drawer.css">
     <script src="product-drawer.js"></script>
   ============================================================ */

(function () {
  'use strict';

  /* ── Internal state ─────────────────────────────────────── */
  let _drawer    = null;
  let _backdrop  = null;
  let _toast     = null;
  let _isOpen    = false;
  let _currentId = null;
  let _photoIdx  = 0;
  let _photos    = [];
  let _wishlist  = [];

  /* ── Breadcrumb auto-detection ──────────────────────────── */
  function _getBreadcrumb() {
    const path = location.pathname;
    if (path.includes('amayaa_search'))  return 'Search results › Product detail';
    if (path.includes('amayaa_sarees'))  return 'Sarees › Product detail';
    if (path.includes('index') || path.endsWith('/')) return 'Home › Product detail';
    return 'Amayaa › Product detail';
  }

  /* ── SVG icons (inline, no external dependency) ─────────── */
  const SVG_WA = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

  const SVG_PHONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>`;

  const SVG_HEART_EMPTY = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
  const SVG_HEART_FULL  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#8B1A4A" stroke="#8B1A4A" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;

  const SVG_SHARE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

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
    _toast.textContent = 'Link copied to clipboard';
    document.body.appendChild(_toast);

    /* Drawer */
    _drawer = document.createElement('div');
    _drawer.className = 'pd-drawer';
    _drawer.setAttribute('role', 'dialog');
    _drawer.setAttribute('aria-modal', 'true');
    _drawer.setAttribute('aria-label', 'Product detail');
    _drawer.innerHTML = `
      <div class="pd-header">
        <div class="pd-header-left">
          <div class="pd-breadcrumb">${_getBreadcrumb()}</div>
          <div class="pd-title">Loading&hellip;</div>
        </div>
        <button class="pd-close-btn" aria-label="Close product detail">&times;</button>
      </div>
      <div class="pd-body">
        <div class="pd-skeleton">
          <div class="pd-skel" style="height:260px;border-radius:10px"></div>
          <div class="pd-skel" style="height:18px;width:60%"></div>
          <div class="pd-skel" style="height:30px;width:40%"></div>
          <div class="pd-skel" style="height:80px"></div>
          <div class="pd-skel" style="height:60px"></div>
        </div>
      </div>
      <div class="pd-footer" style="display:none"></div>`;

    _drawer.querySelector('.pd-close-btn').addEventListener('click', close);
    document.body.appendChild(_drawer);

    /* ESC key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _isOpen) close();
    });

    /* Load wishlist */
    try { _wishlist = JSON.parse(localStorage.getItem('amayaa_wishlist') || '[]'); } catch(e) { _wishlist = []; }
  }

  /* ── Render product into drawer ─────────────────────────── */
  function _render(p) {
    _photos  = (p.photos && p.photos.length) ? p.photos : [];
    _photoIdx = 0;

    /* Badges */
    const badges = (p.badges || []).map(b => {
      if (b === 'new')   return `<span class="pd-badge pd-badge-new">New</span>`;
      if (b === 'offer') return `<span class="pd-badge pd-badge-offer">Offer</span>`;
      if (b === 'featured') return `<span class="pd-badge pd-badge-feat">Featured</span>`;
      return '';
    }).join('');
    const giBadge = p.giTagged ? `<span class="pd-badge pd-badge-gi">GI Tagged</span>` : '';

    /* Price */
    const priceHtml = p.originalPrice
      ? `<span class="pd-price">₹${p.price.toLocaleString('en-IN')}</span>
         <span class="pd-orig-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>
         <span class="pd-savings">Save ₹${(p.originalPrice - p.price).toLocaleString('en-IN')}</span>`
      : `<span class="pd-price">₹${p.price.toLocaleString('en-IN')}</span>`;

    /* Main photo */
    const gradFrom = p.gradientFrom || '#8B1A4A';
    const gradTo   = p.gradientTo   || '#C4622D';
    const mainPhotoHtml = _photos.length
      ? `<img src="${_photos[0]}" alt="${p.name}" loading="lazy">`
      : `<span class="pd-no-photo">Photo coming soon</span>`;
    const mainPhotoBg = !_photos.length
      ? `style="background:linear-gradient(160deg,${gradFrom},${gradTo})"`
      : '';

    /* Thumbnails */
    const thumbsHtml = _photos.length > 1
      ? _photos.slice(0, 6).map((src, i) =>
          `<div class="pd-thumb${i===0?' pd-active':''}" data-idx="${i}" style="background:${p.gradientFrom||'#8B1A4A'}">
             <img src="${src}" alt="View ${i+1}" loading="lazy">
           </div>`).join('')
      : _buildGradientThumbs(p);

    /* Specs */
    const occasion = Array.isArray(p.occasion) ? p.occasion.join(' · ') : (p.occasion || '');
    const specs = [
      { label: 'Fabric',      val: p.fabric      || '—' },
      { label: 'Weave type',  val: p.weaveType   || p.type || '—' },
      { label: 'Length',      val: p.length      || '6.3 metres' },
      { label: 'Blouse piece',val: p.blousePiece || (p.blouseIncluded ? 'Included' : 'Not included') },
      { label: 'Occasion',    val: occasion      || '—' },
      { label: 'Colour',      val: p.colour      || '—' },
    ].map(s => `<div class="pd-spec"><div class="pd-spec-label">${s.label}</div><div class="pd-spec-val">${s.val}</div></div>`).join('');

    /* Weave story body */
    const weaveBody = `
      <p>${p.weaveStory || 'The story of this weave will be added soon.'}</p>
      <div class="pd-weave-facts">
        <div class="pd-wf"><div class="pd-wf-num">${p.weavingDays || '—'}</div><div class="pd-wf-label">Days to weave</div></div>
        <div class="pd-wf"><div class="pd-wf-num">GI</div><div class="pd-wf-label">${p.giTagged ? 'Tagged &amp; certified' : 'Not GI tagged'}</div></div>
        <div class="pd-wf"><div class="pd-wf-num">${p.region ? p.region.split(',')[0] : '—'}</div><div class="pd-wf-label">Region</div></div>
        <div class="pd-wf"><div class="pd-wf-num">2000+</div><div class="pd-wf-label">Years of tradition</div></div>
      </div>`;

    /* CTA links */
    const waText = encodeURIComponent(`Hello! I am interested in ${p.name} (${p.id})`);
    const waUrl  = `https://wa.me/919583946000?text=${waText}`;

    /* Wished? */
    const wished = _wishlist.includes(p.id);

    /* Body HTML */
    const body = _drawer.querySelector('.pd-body');
    body.innerHTML = `
      <div class="pd-photos">
        <div class="pd-main-photo" ${mainPhotoBg}>
          <div class="pd-badge-row">${badges}${giBadge}</div>
          <button class="pd-arr pd-arr-left" aria-label="Previous photo"${_photos.length < 2 ? ' hidden' : ''}>&#8249;</button>
          ${mainPhotoHtml}
          <button class="pd-arr pd-arr-right" aria-label="Next photo"${_photos.length < 2 ? ' hidden' : ''}>&#8250;</button>
          ${_photos.length > 1 ? `<div class="pd-photo-count">1 / ${_photos.length}</div>` : ''}
        </div>
        <div class="pd-thumbs">${thumbsHtml}</div>
      </div>

      <div class="pd-meta">
        <div class="pd-type-line">${p.type || ''} · ${p.region || ''} · ${p.id}</div>
        <div class="pd-price-row">${priceHtml}</div>
      </div>

      <div class="pd-specs">${specs}</div>

      <div class="pd-short-desc">
        <div class="pd-section-title">About this saree</div>
        <p>${p.shortDescription || p.description || ''}</p>
      </div>

      <div class="pd-accordions">
        <div class="pd-acc" id="pd-acc-desc">
          <div class="pd-acc-header"><span class="pd-acc-label">Description</span><span class="pd-acc-icon">+</span></div>
          <div class="pd-acc-body">${p.description || 'Full description coming soon.'}</div>
        </div>
        <div class="pd-acc" id="pd-acc-weave">
          <div class="pd-acc-header"><span class="pd-acc-label">Weave story</span><span class="pd-acc-icon">+</span></div>
          <div class="pd-acc-body">${weaveBody}</div>
        </div>
        <div class="pd-acc" id="pd-acc-care">
          <div class="pd-acc-header"><span class="pd-acc-label">Care instructions</span><span class="pd-acc-icon">+</span></div>
          <div class="pd-acc-body">${p.careInstructions || 'Dry clean only. Store in muslin cloth. Avoid direct sunlight.'}</div>
        </div>
      </div>

      <div class="pd-more-hint" id="pd-more-hint">
        <span class="pd-more-arr">&#8964;</span>
      </div>`;

    /* Footer */
    const footer = _drawer.querySelector('.pd-footer');
    footer.style.display = '';
    footer.innerHTML = `
      <a href="${waUrl}" class="pd-btn-wa" target="_blank" rel="noopener">${SVG_WA} Enquire on WhatsApp</a>
      <a href="tel:+919583946000" class="pd-btn-call">${SVG_PHONE} Call Us — +91 95839 46000</a>
      <div class="pd-footer-row">
        <button class="pd-btn-wish${wished ? ' pd-wished' : ''}" id="pd-wish-btn">
          ${wished ? SVG_HEART_FULL : SVG_HEART_EMPTY}
          <span>${wished ? 'Saved' : 'Save to wishlist'}</span>
        </button>
        <button class="pd-btn-share" id="pd-share-btn" aria-label="Share product link">${SVG_SHARE}</button>
      </div>`;

    /* Update header title */
    _drawer.querySelector('.pd-title').textContent = p.name;

    /* Attach events */
    _attachBodyEvents(p);
    _attachFooterEvents(p);
  }

  /* ── Gradient thumbs fallback (no photos yet) ───────────── */
  function _buildGradientThumbs(p) {
    const from = p.gradientFrom || '#8B1A4A';
    const to   = p.gradientTo   || '#C4622D';
    const mids = [
      `linear-gradient(135deg, ${from}, ${to})`,
      `linear-gradient(135deg, ${to}, #E8A020)`,
      `linear-gradient(135deg, #E8A020, #F0C040)`,
      `linear-gradient(135deg, #3A1A0A, ${from})`,
    ];
    return mids.map((g, i) =>
      `<div class="pd-thumb${i===0?' pd-active':''}" data-idx="${i}" style="background:${g}"></div>`
    ).join('');
  }

  /* ── Photo navigation ───────────────────────────────────── */
  function _setPhoto(idx) {
    if (!_photos.length) return;
    _photoIdx = (idx + _photos.length) % _photos.length;
    const main = _drawer.querySelector('.pd-main-photo');
    const img  = main.querySelector('img');
    if (img) img.src = _photos[_photoIdx];
    const count = main.querySelector('.pd-photo-count');
    if (count) count.textContent = `${_photoIdx + 1} / ${_photos.length}`;
    _drawer.querySelectorAll('.pd-thumb').forEach((t, i) => {
      t.classList.toggle('pd-active', i === _photoIdx);
    });
  }

  /* ── Attach body events ─────────────────────────────────── */
  function _attachBodyEvents(p) {
    /* Arrow buttons */
    const btnL = _drawer.querySelector('.pd-arr-left');
    const btnR = _drawer.querySelector('.pd-arr-right');
    if (btnL) btnL.addEventListener('click', () => _setPhoto(_photoIdx - 1));
    if (btnR) btnR.addEventListener('click', () => _setPhoto(_photoIdx + 1));

    /* Thumbnails */
    _drawer.querySelectorAll('.pd-thumb').forEach(t => {
      t.addEventListener('click', () => _setPhoto(parseInt(t.dataset.idx, 10)));
    });

    /* Accordions */
    _drawer.querySelectorAll('.pd-acc-header').forEach(h => {
      h.addEventListener('click', () => {
        h.closest('.pd-acc').classList.toggle('pd-acc-open');
      });
    });

    /* More hint — hide after first scroll */
    const body = _drawer.querySelector('.pd-body');
    const hint = _drawer.querySelector('#pd-more-hint');
    if (hint) {
      body.addEventListener('scroll', function onScroll() {
        if (body.scrollTop > 40) {
          hint.classList.add('pd-hidden');
          body.removeEventListener('scroll', onScroll);
        }
      });
    }
  }

  /* ── Attach footer events ───────────────────────────────── */
  function _attachFooterEvents(p) {
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
        navigator.clipboard.writeText(url).then(() => _showToast()).catch(() => {
          prompt('Copy this link:', url);
        });
      });
    }
  }

  /* ── Toast ──────────────────────────────────────────────── */
  function _showToast() {
    _toast.classList.add('pd-show');
    setTimeout(() => _toast.classList.remove('pd-show'), 2200);
  }

  /* ── Scroll lock helpers ────────────────────────────────── */
  function _lockScroll() {
    document.body.style.overflow = 'hidden';
    /* Blur the main page content (everything except drawer and backdrop) */
    document.querySelectorAll('body > *:not(.pd-drawer):not(.pd-backdrop):not(.pd-toast)')
      .forEach(el => el.classList.add('pd-page-blur'));
  }
  function _unlockScroll() {
    document.body.style.overflow = '';
    document.querySelectorAll('.pd-page-blur')
      .forEach(el => el.classList.remove('pd-page-blur'));
  }

  /* ── Public API: open ───────────────────────────────────── */
  function open(productId) {
    if (!productId) return;
    _build();

    _currentId = productId;
    _isOpen    = true;

    /* Show skeleton immediately */
    _drawer.querySelector('.pd-body').innerHTML = `
      <div class="pd-skeleton">
        <div class="pd-skel" style="height:260px;border-radius:10px"></div>
        <div class="pd-skel" style="height:18px;width:60%;margin-top:4px"></div>
        <div class="pd-skel" style="height:30px;width:40%"></div>
        <div class="pd-skel" style="height:80px"></div>
        <div class="pd-skel" style="height:60px"></div>
      </div>`;
    _drawer.querySelector('.pd-title').textContent = 'Loading…';
    _drawer.querySelector('.pd-footer').style.display = 'none';

    /* Animate open */
    requestAnimationFrame(() => {
      _backdrop.classList.add('pd-open');
      _drawer.classList.add('pd-open');
    });
    _lockScroll();

    /* Update URL */
    const url = new URL(location.href);
    url.searchParams.set('id', productId);
    history.pushState({ pdId: productId }, '', url.toString());

    /* Fetch product data */
    fetch('data/products/' + productId + '.json')
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(p  => { if (_currentId === productId) _render(p); })
      .catch(() => {
        if (_currentId !== productId) return;
        _drawer.querySelector('.pd-title').textContent = 'Product not found';
        _drawer.querySelector('.pd-body').innerHTML = `
          <div class="pd-error">
            <p class="pd-error-msg">We couldn’t load this product.</p>
            <span class="pd-error-link" onclick="ProductDrawer.close()">Back to search</span>
          </div>`;
      });
  }

  /* ── Public API: close ──────────────────────────────────── */
  function close() {
    if (!_isOpen) return;
    _isOpen    = false;
    _currentId = null;

    _backdrop.classList.remove('pd-open');
    _drawer.classList.remove('pd-open');
    _unlockScroll();

    /* Remove ?id= from URL */
    const url = new URL(location.href);
    url.searchParams.delete('id');
    history.pushState({}, '', url.toString());
  }

  /* ── Deep-link: auto-open on page load if ?id= present ─── */
  function _checkDeepLink() {
    const id = new URLSearchParams(location.search).get('id');
    if (id) open(id);
  }

  /* ── Handle browser back/forward through history ────────── */
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.pdId) {
      open(e.state.pdId);
    } else if (_isOpen) {
      close();
    }
  });

  /* ── Expose public API ──────────────────────────────────── */
  window.ProductDrawer = { open: open, close: close };

  /* ── Init on DOM ready ──────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _checkDeepLink);
  } else {
    _checkDeepLink();
  }

})();
