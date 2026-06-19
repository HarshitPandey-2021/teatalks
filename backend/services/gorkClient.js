// Minimal Gork/Groq API client wrapper.
// Supports Groq OpenAI-compatible endpoints and basic moderation responses.
// Set GORK_API_URL to the full chat endpoint, for example:
//   https://api.groq.com/openai/v1/chat/completions
// The wrapper also accepts GORK_API_KEY or GROQ_API_KEY.

function parseJsonFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeResponse(json) {
  if (!json || typeof json !== 'object') {
    return { toxicity: 0, isToxic: false, reasons: [], suggestions: [] };
  }

  if (Array.isArray(json.choices) && json.choices[0]) {
    const content = json.choices[0]?.message?.content || json.choices[0]?.text || '';
    const parsed = parseJsonFromText(content);
    if (parsed && typeof parsed === 'object') {
      json = parsed;
    }
  }

  const toxicity = typeof json?.toxicity === 'number'
    ? json.toxicity
    : (typeof json?.score === 'number' ? json.score : 0);

  const isToxic = typeof json?.isToxic === 'boolean'
    ? json.isToxic
    : toxicity > 0.5;

  const reasons = Array.isArray(json?.reasons)
    ? json.reasons
    : (Array.isArray(json?.labels) ? json.labels : []);

  const suggestions = Array.isArray(json?.suggestions)
    ? json.suggestions
    : [];

  return {
    toxicity: Math.min(Math.max(Number(toxicity) || 0, 0), 1),
    isToxic,
    reasons,
    suggestions,
  };
}

async function getGorkToxicityScore(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  const key = process.env.GORK_API_KEY || process.env.GROQ_API_KEY;
  const url = process.env.GORK_API_URL;
  const model = process.env.GORK_MODEL || 'openai/gpt-oss-safeguard-20b';

  if (!key) {
    const err = new Error('GROQ_API_KEY / GORK_API_KEY not set');
    err.code = 'GORK_NO_KEY';
    throw err;
  }

  if (!url) {
    const err = new Error('GORK_API_URL not set (e.g. https://api.groq.com/openai/v1/chat/completions)');
    err.code = 'GORK_NO_URL';
    throw err;
  }

  if (typeof fetch !== 'function') {
    const err = new Error('Global fetch is unavailable in this Node runtime');
    err.code = 'FETCH_UNAVAILABLE';
    throw err;
  }

  const normalizedUrl = url.endsWith('/openai/v1')
    ? `${url.replace(/\/$/, '')}/chat/completions`
    : url;

  const body = normalizedUrl.includes('/chat/completions')
    ? {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a content moderation assistant. Analyze the user text for toxicity and return valid JSON only with keys: toxicity, isToxic, reasons, suggestions.',
        },
        {
          role: 'user',
          content: text,
        }
      ],
      temperature: 0,
      max_tokens: 256,
    }
    : { text };

  const controller = new AbortController();
  const timeoutMs = Number(process.env.GORK_TIMEOUT_MS || 10000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(normalizedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      const err = new Error(`Gork API error: ${res.status}`);
      err.status = res.status;
      err.details = bodyText;
      throw err;
    }

    const json = await res.json();
    return normalizeResponse(json);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { getGorkToxicityScore };
