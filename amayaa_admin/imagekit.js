/**
 * imagekit.js — Shared ImageKit upload helper for Amayaa Admin
 * Stores private key in localStorage under 'amayaa_ik_private_key'
 * Usage: _ikUpload(file, '/products') → Promise<string> (ImageKit URL)
 */

var IK_BASE = 'https://ik.imagekit.io/Amayaa2026';
var IK_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

function _ikPrivateKey() {
  return localStorage.getItem('amayaa_ik_private_key') || '';
}

/**
 * Upload a File object to ImageKit.
 * @param {File} file — the image file
 * @param {string} folder — e.g. '/products', '/banners', '/blog'
 * @param {string} [fileName] — override filename (default: file.name, spaces → underscores)
 * @returns {Promise<string>} — resolves to full ImageKit URL with transforms
 */
function _ikUpload(file, folder, fileName) {
  return new Promise(function(resolve, reject) {
    var key = _ikPrivateKey();
    if (!key) {
      var k = prompt('Enter your ImageKit Private API Key (stored in browser only):');
      if (!k) { reject(new Error('No ImageKit key')); return; }
      localStorage.setItem('amayaa_ik_private_key', k);
      key = k;
    }

    var name = (fileName || file.name).replace(/\s+/g, '_');

    var reader = new FileReader();
    reader.onload = function(ev) {
      // ImageKit accepts base64 string directly
      var b64 = ev.target.result; // data:image/...;base64,XXXX

      var form = new FormData();
      form.append('file', b64);
      form.append('fileName', name);
      form.append('folder', folder);
      form.append('useUniqueFileName', 'false');

      var authHeader = 'Basic ' + btoa(key + ':');

      fetch(IK_UPLOAD_URL, {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: form
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.url) {
          resolve(res.url);
        } else {
          // Bad key? clear it so next attempt re-prompts
          if (res.message && res.message.toLowerCase().includes('auth')) {
            localStorage.removeItem('amayaa_ik_private_key');
          }
          reject(new Error(res.message || 'ImageKit upload failed'));
        }
      })
      .catch(reject);
    };
    reader.onerror = function() { reject(new Error('File read failed')); };
    reader.readAsDataURL(file);
  });
}

/**
 * Delete a single ImageKit file by its fileId.
 * @param {string} fileId — ImageKit fileId (not the URL)
 * @param {string} key — IK private key
 * @returns {Promise}
 */
function _ikDeleteFile(fileId, key) {
  var auth = 'Basic ' + btoa(key + ':');
  return fetch('https://api.imagekit.io/v1/files/' + fileId, {
    method: 'DELETE',
    headers: { 'Authorization': auth }
  });
}

/**
 * Search ImageKit for a file by name in /products folder, return fileIds.
 * @param {string} fileName — e.g. "AMY-KGB-001_Look1.jpg"
 * @param {string} key — IK private key
 * @returns {Promise<string[]>} array of fileIds
 */
function _ikFindByName(fileName, key) {
  var auth = 'Basic ' + btoa(key + ':');
  // Strip transform params from URL if full URL was passed
  fileName = fileName.replace(/\?.*$/, '').split('/').pop();
  return fetch('https://api.imagekit.io/v1/files?path=/products&name=' + encodeURIComponent(fileName), {
    headers: { 'Authorization': auth }
  })
  .then(function(r) { return r.ok ? r.json() : []; })
  .then(function(arr) { return Array.isArray(arr) ? arr.map(function(f){return f.fileId;}) : []; })
  .catch(function() { return []; });
}

/**
 * Delete all ImageKit photos for a product.
 * Resolves fileIds by searching for each URL's filename, then bulk-deletes.
 * @param {string} productId — e.g. "AMY-KGB-001"
 * @param {string[]} photoUrls — IK photo URLs from detail JSON
 * @returns {Promise<{deleted:number, failed:number}>}
 */
function _ikDeleteProductImages(productId, photoUrls) {
  var key = _ikPrivateKey();
  if (!key || !photoUrls || !photoUrls.length) {
    return Promise.resolve({ deleted: 0, failed: 0 });
  }
  var auth = 'Basic ' + btoa(key + ':');
  // Collect all fileId lookups in parallel
  var lookups = photoUrls.map(function(url) { return _ikFindByName(url, key); });
  return Promise.all(lookups)
    .then(function(results) {
      var fileIds = [];
      results.forEach(function(ids) { ids.forEach(function(id){if(id)fileIds.push(id);}); });
      if (!fileIds.length) return { deleted: 0, failed: 0 };
      return fetch('https://api.imagekit.io/v1/files/bulk/delete', {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: fileIds })
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        var deleted = (res.successfullyDeletedFileIds || []).length;
        var failed  = fileIds.length - deleted;
        return { deleted: deleted, failed: failed };
      });
    })
    .catch(function() { return { deleted: 0, failed: 0 }; });
}

/**
 * Convenience: open file picker, upload, call back with URL
 * @param {string} folder — ImageKit target folder
 * @param {function} onUrl — callback(url) on success
 * @param {HTMLElement} [statusEl] — optional element to show status messages
 */
function _ikPick(folder, onUrl, statusEl) {
  var fi = document.createElement('input');
  fi.type = 'file';
  fi.accept = 'image/jpeg,image/png,image/webp';
  fi.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return; }
    if (statusEl) statusEl.textContent = '⏳ Uploading to ImageKit…';
    _ikUpload(file, folder)
      .then(function(url) {
        if (statusEl) {
          statusEl.textContent = '✅ Uploaded!';
          setTimeout(function() { statusEl.textContent = ''; }, 4000);
        }
        onUrl(url);
      })
      .catch(function(err) {
        if (statusEl) statusEl.textContent = '❌ ' + err.message;
        console.error('IK upload error:', err);
      });
  };
  fi.click();
}
