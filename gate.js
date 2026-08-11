/**
 * gate.js — Amayaa preview gate (cookie-based)
 *
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * • Visiting ?preview=amayaa2026 sets a session cookie and continues normally.
 * • Any page that loads this script checks for the cookie.
 *   – Cookie present  → page loads normally (invisible to visitors, site works).
 *   – Cookie absent   → user is immediately redirected to coming_soon.html.
 *
 * TO PREVIEW THE SITE (you or team members)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Open: https://amayaabypolkadots.in/index.html?preview=amayaa2026
 *   The cookie is set for that browser session. All pages are then accessible
 *   until you close the browser tab group or clear cookies.
 *   Repeat the URL on each device / browser you want to test.
 *
 * TO REMOVE THE GATE (going live)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Remove the <script src="gate.js"></script> tag from every HTML page's
 *   <head>, then delete gate.js and coming_soon.html, and redeploy.
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function(){
  var COOKIE = 'amayaa_preview';
  var SECRET = 'amayaa2026';
  var GATE_PAGE = 'coming_soon.html';

  /* ── Helper: read a cookie by name ── */
  function getCookie(name){
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  /* ── Helper: set a session cookie (no expiry = session lifetime) ── */
  function setCookie(name, value){
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; SameSite=Lax';
  }

  /* ── Check URL for ?preview=... and set cookie if correct ── */
  var params = new URLSearchParams(window.location.search);
  if(params.get('preview') === SECRET){
    setCookie(COOKIE, SECRET);
    /* Remove the ?preview param from the URL bar (clean appearance) */
    params.delete('preview');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', clean);
    /* Cookie set — allow page to load */
    return;
  }

  /* ── Already has valid cookie — allow page to load ── */
  if(getCookie(COOKIE) === SECRET){
    return;
  }

  /* ── No valid cookie — redirect to coming soon ── */
  /* Avoid redirect loop if we ARE already on the gate page */
  if(window.location.pathname.indexOf(GATE_PAGE) === -1){
    window.location.replace(GATE_PAGE);
  }
})();
