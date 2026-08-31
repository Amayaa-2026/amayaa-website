/**
 * audit.js — Shared Audit Trail helper for Amayaa Admin
 *
 * Usage:
 *   AuditTrail.log({
 *     action: 'update',          // 'create' | 'update' | 'delete'
 *     entity: 'product',         // 'product' | 'blog' | 'banner' | 'category' | 'settings' | 'about' | 'faq' | 'policy' | 'collection'
 *     entityId: 'AMY-BAN-001',   // id or title of the item
 *     summary: 'Updated price',  // human-readable one-liner
 *     changes: [                 // optional array of field-level changes
 *       { field: 'price', before: 8000, after: 9000 }
 *     ]
 *   });
 *
 * The helper:
 *   1. Reads settings.json to check if auditTrailEnabled is true
 *   2. If enabled: reads current audit_trail.json, prepends the new record, writes back via GitHub API
 *   3. If disabled: silently does nothing
 *
 * Requires the GitHub PAT to be set in localStorage('amayaa_gh_token').
 */

var AuditTrail = (function() {

  var REPO    = 'Amayaa-2026/amayaa-website';
  var BRANCH  = 'main';
  var API_BASE= 'https://api.github.com/repos/' + REPO + '/contents/';
  var TRAIL_PATH = 'data/audit_trail.json';
  var SETTINGS_PATH = 'data/settings.json';

  function _tok() {
    return localStorage.getItem('amayaa_gh_token') || '';
  }

  function _b64decode(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str.replace(/\s/g,'%20'))))); } catch(e) { return null; }
  }

  function _utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function _ghGet(path) {
    var tok = _tok();
    if (!tok) return Promise.reject(new Error('No GitHub token'));
    return fetch(API_BASE + path + '?ref=' + BRANCH, {
      headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json' }
    }).then(function(r) { return r.json(); });
  }

  function _ghPut(path, content, sha, message) {
    var tok = _tok();
    if (!tok) return Promise.reject(new Error('No GitHub token'));
    return fetch(API_BASE + path, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + tok,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message, content: _utf8ToB64(JSON.stringify(content, null, 2)), sha: sha, branch: BRANCH })
    }).then(function(r) { return r.json(); });
  }

  /**
   * Log an admin action to audit_trail.json (if audit trail is enabled).
   * entry: { action, entity, entityId, summary, changes[] }
   * Returns a Promise that resolves when done (or immediately if disabled/no token).
   */
  function log(entry) {
    var tok = _tok();
    if (!tok) return Promise.resolve(); // silently skip — no token

    // Check settings first
    return _ghGet(SETTINGS_PATH).then(function(settingsFile) {
      var settings = null;
      try { settings = (function(_b){var _u=new Uint8Array(_b.length);for(var _i=0;_i<_b.length;_i++)_u[_i]=_b.charCodeAt(_i);return JSON.parse(new TextDecoder().decode(_u));})(atob(settingsFile.content.replace(/\s/g,''))); } catch(e) {}
      if (!settings || !settings.siteControls || !settings.siteControls.auditTrailEnabled) {
        return; // audit trail disabled — silent no-op
      }

      // Build the log record
      var record = {
        ts:       new Date().toISOString(),
        action:   entry.action   || 'update',
        entity:   entry.entity   || 'unknown',
        entityId: entry.entityId || '',
        summary:  entry.summary  || '',
        changes:  entry.changes  || []
      };

      // Read current trail
      return _ghGet(TRAIL_PATH).then(function(trailFile) {
        var trail = [];
        try { trail = (function(_b){var _u=new Uint8Array(_b.length);for(var _i=0;_i<_b.length;_i++)_u[_i]=_b.charCodeAt(_i);return JSON.parse(new TextDecoder().decode(_u));})(atob(trailFile.content.replace(/\s/g,''))); } catch(e) {}
        if (!Array.isArray(trail)) trail = [];

        // Prepend new record (newest first), cap at 500 entries to keep file size manageable
        trail.unshift(record);
        if (trail.length > 500) trail = trail.slice(0, 500);

        var sha = trailFile.sha;
        return _ghPut(TRAIL_PATH, trail, sha, 'Audit: ' + record.action + ' ' + record.entity + (record.entityId ? ' [' + record.entityId + ']' : ''));
      });
    }).catch(function(e) {
      // Never block the main operation — audit failures are silent
      console.warn('[AuditTrail] Failed to log:', e);
    });
  }

  /**
   * Utility: read the current trail (for dashboard/audit page use).
   * Returns a Promise<Array>.
   */
  function read() {
    return _ghGet(TRAIL_PATH).then(function(f) {
      try { return (function(_b){var _u=new Uint8Array(_b.length);for(var _i=0;_i<_b.length;_i++)_u[_i]=_b.charCodeAt(_i);return JSON.parse(new TextDecoder().decode(_u));})(atob(f.content.replace(/\s/g,''))); } catch(e) { return []; }
    }).catch(function() { return []; });
  }

  return { log: log, read: read };

})();
