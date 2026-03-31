function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBackoff(fn, { retries = 5, baseDelayMs = 500 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status;
      if (status !== 429 || attempt >= retries) {
        throw err;
      }
      const backoff = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 200);
      await sleep(backoff + jitter);
      attempt += 1;
    }
  }
}

// abusive words list
const abusiveWords = [
  // Strong Hindi abuses
  "madarchod", "madarchood", "mc",
  "behenchod", "bhenchod", "bc",
  "bhosdike", "bhosdi", "bhosdika",
  "chutiya", "chutya", "chutiye",
  "gandu", "gaand", "gaandfat",
  "randi", "randwa",
  "harami", "haraamzada",
  "kutte", "kutta", "kamine", "kamina",
  "lund", "loda", "lawda", "lavda",
  "jhant", "jhaant",
  "tatti", "tatte",
  "bakchod", "bakchodi",
  
  // Hinglish / variations
  "mc bc", "bkl", "bkc", "bkchodi",
  "chut", "gaand mara", "gaand me",
  "teri maa", "teri behen",
  "maa chudaye", "behen chudaye",
  "maa ki", "behen ki",
  
  // English strong
  "fuck", "fucker", "fucking",
  "bitch", "bitches",
  "asshole", "ass",
  "bastard",
  "slut", "whore",
  "dick", "pussy",
  "motherfucker", "mf",
  "bullshit", "shit", "shithead",
  "jackass",
  
  // Mild insults (IMPORTANT for detection)
  "stupid", "idiot", "dumb",
  "moron", "loser", "trash",
  "useless", "nonsense",
  "fool", "clown",
  "noob", "retard",
  
  // Religious / hate (basic)
  "terrorist", "jihadi",
  "bhakt", "andhbhakt",
  
  // Internet slang toxicity
  "lmao idiot", "wtf",
  "stfu", "kys",
  "fk", "fck", "fuk",
  "bs", "af",
  
  // Masked / censored forms
  "f*ck", "b*tch", "a**hole",
  "m*therf*cker",
  
  // Phonetic Hinglish (very important)
  "madar", "bhen", "chod",
  "gand", "gnd",
  "lnd", "ld",
  "chut", "ch*t",
  
  // Common toxic phrases
  "go to hell",
  "shut up",
  "get lost",
  "bloody fool",
  "son of a bitch"
];

// normalize
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// language detect
function detectLanguage(text) {
  const hindiRegex = /[\u0900-\u097F]/;

  if (hindiRegex.test(text)) return "hindi";
  if (text.match(/(tum|kya|hai|nahi|bhai)/i)) return "hinglish";

  return "english";
}

// keyword score
function keywordScore(text) {
  let score = 0;

  abusiveWords.forEach(word => {
    if (text.includes(word)) score += 0.2;
  });

  return Math.min(score, 1);
}

// MAIN FUNCTION (🔥 use this anywhere)
export async function detectToxicity(text) {
  if (!text) throw new Error("Text is required");

  const normalized = normalize(text);
  const language = detectLanguage(normalized);
  const keywordToxicity = keywordScore(normalized);

  const apiUrl = process.env.TOXICITY_API_URL || "https://toxicity.bhowmickmrinank.workers.dev/";

  const response = await withBackoff(async () => {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: normalized })
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const err = new Error(
        errorBody?.message || `Toxicity API error: ${res.status}`
      );
      err.status = res.status;
      err.details = errorBody || null;
      throw err;
    }

    return res.json();
  });

  const aiScore =
    typeof response?.toxicity === "number"
      ? response.toxicity
      : typeof response?.score === "number"
        ? response.score
        : typeof response?.result === "number"
          ? response.result
          : typeof response?.result?.toxicity === "number"
            ? response.result.toxicity
            : 0;

  const finalScore = Math.min(1, (aiScore + keywordToxicity) / 2);

  return {
    original: text,
    normalized,
    language,
    score: finalScore,
    aiScore,
    keywordScore: keywordToxicity,
    isToxic: finalScore > 0.5
  };
}
