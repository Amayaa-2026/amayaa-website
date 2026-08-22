/**
 * imagekit.js — Shared ImageKit upload helper for Amayaa Admin
 * Stores private key in localStorage under 'amayaa_ik_private_key'
 * Usage: _ikUpload(file, '/products') → Promise<string> (ImageKit URL)
 */

var IK_BASE = 'https://ik.imagekit.io/Amayaa2026';
var IK_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
var IK_TR = '?tr=f-auto,q-85';

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
          resolve(res.url + IK_TR);
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
