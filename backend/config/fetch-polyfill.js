// Lightweight fetch polyfill: use native fetch when available (Node 18+),
// otherwise try to load 'node-fetch' dynamically. This file is safe to require
// early during startup and will not throw if polyfill is unavailable.
try {
  if (typeof global.fetch === 'function') {
    // native fetch present
  } else {
    // Try to require node-fetch (v3+ ESM export compatibility handled)
    // Use dynamic require to avoid breaking environments without node-fetch installed.
    try {
      // node-fetch v2 uses default export, v3 is ESM; the require may return a function or an object.
      const nf = require('node-fetch');
      if (typeof nf === 'function') {
        global.fetch = nf;
      } else if (nf && typeof nf.default === 'function') {
        global.fetch = nf.default;
      }

      // AbortController polyfill (node-abort-controller or node-fetch exports) if needed
      if (typeof global.AbortController === 'undefined') {
        try {
          const ac = require('abort-controller');
          global.AbortController = ac;
        } catch (e) {
          // ignore — AbortController may not be required in all code paths
        }
      }
    } catch (e) {
      // No node-fetch available; leave native globals undefined. Code that depends on fetch should
      // already check for availability and fail gracefully (toxicityService does this).
    }
  }
} catch (err) {
  // Silently ignore any errors in polyfill setup to avoid startup failures.
}

module.exports = {};
