// Minimal Gork/Gorq API client wrapper.
// Configure endpoint with GORK_API_URL and key with GORK_API_KEY in .env
// Expected response shape (flexible): { toxicity: 0.0, isToxic: true, reasons: [], suggestions: [] }

async function getGorkToxicityScore(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  const key = process.env.GORK_API_KEY;
  const url = process.env.GORK_API_URL;

  if (!key) {
    const err = new Error('GORK_API_KEY not set');
    err.code = 'GORK_NO_KEY';
    throw err;
  }

  if (!url) {
    const err = new Error('GORK_API_URL not set (e.g. https://api.gorq.example/moderation)');
    err.code = 'GORK_NO_URL';
    throw err;
  }

  if (typeof fetch !== 'function') {
    const err = new Error('Global fetch is unavailable in this Node runtime');
    err.code = 'FETCH_UNAVAILABLE';
    throw err;
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.GORK_TIMEOUT_MS || 10000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(`Gork API error: ${res.status}`);
      err.status = res.status;
      err.details = body;
      throw err;
    }

    const json = await res.json();

    // Flexible mapping of fields from provider
    const toxicity = typeof json?.toxicity === 'number'
      ? json.toxicity
      : (typeof json?.score === 'number' ? json.score : 0);

    const isToxic = typeof json?.isToxic === 'boolean' ? json.isToxic : toxicity > 0.5;

    const reasons = Array.isArray(json?.reasons) ? json.reasons : (Array.isArray(json?.labels) ? json.labels : []);
    const suggestions = Array.isArray(json?.suggestions) ? json.suggestions : [];

    return {
      toxicity: Math.min(Math.max(Number(toxicity) || 0, 0), 1),
      isToxic,
      reasons,
      suggestions,
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { getGorkToxicityScore };
