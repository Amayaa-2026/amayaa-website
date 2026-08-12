/**
 * gate.js — Amayaa preview gate
 *
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Reads data/settings.json synchronously (tiny file, CDN-cached).
 *    – If siteControls.comingSoon === false → gate is OFF for ALL devices.
 *      No cookie or preview URL needed. Site is fully open.
 *    – If comingSoon === true → gate is ON; proceed to cookie check below.
 *
 * 2. Cookie / preview-URL logic (only when comingSoon is true):
 *    – Visiting ?preview=<key> sets a persistent cookie (30 days) and allows access.
 *    – Cookie present → page loads normally.
 *    – No cookie → redirect to coming_soon.html.
 *
 * TO TURN OFF COMING SOON (go live)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Set "comingSoon": false in data/settings.json and commit + push.
 *   Works immediately on ALL devices — no cookie required.
 *
 * TO PREVIEW WHILE GATE IS ON (you or team members)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Open: https://amayaabypolkadots.in/index.html?preview=amayaa2026
 *   Cookie is set for 30 days. Repeat on each new device/browser.
 *
 * PREVIEW KEY
 * ─────────────────────────────────────────────────────────────────────────────
 *   Controlled by siteControls.comingSoonPreviewKey in settings.json.
 *   Default: "amayaa2026"
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function(){
  var COOKIE      = 'amayaa_preview';
  var GATE_PAGE   = 'coming_soon.html';
  var DEFAULT_KEY = 'amayaa2026';

  /* ── Skip gate entirely on localhost / file:// (dev environments) ── */
  var host = window.location.hostname;
  if(host === 'localhost' || host === '127.0.0.1' || host === '' || host.endsWith('.local')){
    return;
  }

  /* ── Read settings.json synchronously to check comingSoon flag ── */
  var comingSoon = true;   /* safe default: gate ON if fetch fails */
  var previewKey = DEFAULT_KEY;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/settings.json', false /* synchronous */);
    xhr.send(null);
    if(xhr.status === 200){
      var cfg = JSON.parse(xhr.responseText);
      if(cfg && cfg.siteControls){
        comingSoon = cfg.siteControls.comingSoon !== false; /* undefined → true */
        if(cfg.siteControls.comingSoonPreviewKey){
          previewKey = cfg.siteControls.comingSoonPreviewKey;
        }
      }
    }
  } catch(e){ /* network error or JSON parse fail — keep defaults */ }

  /* ── Gate is OFF: allow everyone through on every device ── */
  if(!comingSoon){ return; }

  /* ── Gate is ON: cookie / preview-URL logic ── */

  function getCookie(name){
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value){
    /* 30-day persistent cookie — survives browser restarts */
    var exp = new Date(Date.now() + 30*24*60*60*1000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; expires=' + exp + '; SameSite=Lax';
  }

  /* Check ?preview= param */
  var params = new URLSearchParams(window.location.search);
  if(params.get('preview') === previewKey){
    setCookie(COOKIE, previewKey);
    params.delete('preview');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', clean);
    return; /* allow page */
  }

  /* Check cookie */
  if(getCookie(COOKIE) === previewKey){ return; }

  /* No valid cookie → redirect to coming soon (avoid loop) */
  if(window.location.pathname.indexOf(GATE_PAGE) === -1){
    window.location.replace(GATE_PAGE);
  }
})();
