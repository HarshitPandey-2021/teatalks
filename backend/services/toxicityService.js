function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneRegex(regex) {
  return new RegExp(regex.source, regex.flags);
}

function getEnvValue(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

async function withBackoff(fn, { retries = 5, baseDelayMs = 500 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status;
      const code = err?.code;
      const isRetryableStatus = [408, 429, 500, 502, 503, 504].includes(status);
      const isRetryableCode =
        code === "FEATHERLESS_TIMEOUT" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT";

      if ((!isRetryableStatus && !isRetryableCode) || attempt >= retries) {
        throw err;
      }
      const backoff = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 200);
      await sleep(backoff + jitter);
      attempt += 1;
    }
  }
}

// ===== COMPREHENSIVE PATTERNS =====

const abusiveWords = [
  // Strong Hindi abuses + all spelling variations
  "madarchod", "madarchood", "mc", "madrchod", "madarchd",
  "behenchod", "bhenchod", "bc", "bhnchod", "behenchd",
  "bhosdike", "bhosdi", "bhosdika", "bsdk", "bhosdiwale",
  "chutiya", "chutya", "chutiye", "chutiy", "chtiya", "cutiya", "chtya",
  "gandu", "gaand", "gaandfat", "gand", "gandfat",
  "randi", "randwa", "rndi", "randiya",
  "harami", "haraamzada", "haramzada", "hrami",
  "kutte", "kutta", "kamine", "kamina", "kamini", "kminay",
  "lund", "loda", "lawda", "lavda", "lode", "laude",
  "jhant", "jhaant", "jhaat",
  "tatti", "tatte", "tatti",
  "bakchod", "bakchodi", "bkchod",
  
  // Hinglish / variations
  "mc bc", "bkl", "bkc", "bkchodi",
  "chut", "gaand mara", "gaand me",
  "teri maa", "teri behen",
  "maa chudaye", "behen chudaye",
  "maa ki", "behen ki",
  
  // English strong
  "fuck", "fucker", "fucking", "fck", "fuk", "fk",
  "bitch", "bitches", "bich", "btch",
  "asshole", "ass", "ashole",
  "bastard", "bstrd", "bastrd",
  "slut", "whore",
  "dick", "pussy", "dck", "psy",
  "motherfucker", "mf", "mthrfckr",
  "bullshit", "shit", "shithead", "sht",
  "jackass",
  
  // Mild insults
  "stupid", "idiot", "dumb",
  "moron", "loser", "trash",
  "useless", "nonsense",
  "fool", "clown",
  "noob", "retard",
  
  // Religious / hate
  "terrorist", "jihadi",
  "bhakt", "andhbhakt",
  
  // Internet slang
  "stfu", "kys",
  "fk", "fck", "fuk",
  
  // Phonetic Hinglish
  "madar", "bhen", "chod",
  "gand", "gnd",
  "lnd", "ld",
  
  // Common toxic phrases
  "go to hell",
  "shut up",
  "get lost",
  "bloody fool",
  "son of a bitch",
  
  // Additional Hindi insults
  "bewakoof", "gadha", "ullu", "saala",
  "nalayak", "bekaar", "ghatiya", "faltu",
  "nikamma", "pagal", "paagal"
];

// 🆕 Masked/censored words - EXPANDED to catch all evasion tricks
const maskedAbusivePatterns = [
  // English masked
  /f[\W_]*u[\W_]*c[\W_]*k/gi,
  /b[\W_]*i[\W_]*t[\W_]*c[\W_]*h/gi,
  /a[\W_]*s[\W_]*s[\W_]*h[\W_]*o[\W_]*l[\W_]*e/gi,
  /s[\W_]*h[\W_]*i[\W_]*t/gi,
  /m[\W_]*o[\W_]*t[\W_]*h[\W_]*e[\W_]*r[\W_]*f[\W_]*u[\W_]*c[\W_]*k/gi,
  /d[\W_]*i[\W_]*c[\W_]*k/gi,
  /p[\W_]*u[\W_]*s[\W_]*s[\W_]*y/gi,
  /w[\W_]*h[\W_]*o[\W_]*r[\W_]*e/gi,
  /s[\W_]*l[\W_]*u[\W_]*t/gi,
  /b[\W_]*a[\W_]*s[\W_]*t[\W_]*a[\W_]*r[\W_]*d/gi,
  
  // Hindi masked - CRITICAL
  /c[\W_]*h[\W_]*u[\W_]*t[\W_]*i[\W_]*y[\W_]*a/gi,
  /c[\W_]*h[\W_]*u[\W_]*t/gi,
  /g[\W_]*a[\W_]*a?[\W_]*n[\W_]*d/gi,
  /l[\W_]*u[\W_]*n[\W_]*d/gi,
  /l[\W_]*o[\W_]*d[\W_]*a/gi,
  /l[\W_]*a[\W_]*w[\W_]*d[\W_]*a/gi,
  /r[\W_]*a[\W_]*n[\W_]*d[\W_]*i/gi,
  /b[\W_]*h[\W_]*o[\W_]*s[\W_]*d/gi,
  /m[\W_]*a[\W_]*d[\W_]*a[\W_]*r[\W_]*c[\W_]*h[\W_]*o[\W_]*d/gi,
  /b[\W_]*h[\W_]*e[\W_]*n[\W_]*c[\W_]*h[\W_]*o[\W_]*d/gi,
  /g[\W_]*a[\W_]*n[\W_]*d[\W_]*u/gi,
  /h[\W_]*a[\W_]*r[\W_]*a[\W_]*m[\W_]*i/gi,
  /k[\W_]*a[\W_]*m[\W_]*i[\W_]*n[\W_]*a/gi,
  /b[\W_]*a[\W_]*k[\W_]*c[\W_]*h[\W_]*o[\W_]*d/gi,
  /t[\W_]*a[\W_]*t[\W_]*t[\W_]*i/gi,
  
  // Internet slang
  /\bwtf\b/gi,
  /\bstfu\b/gi,
  /\bkys\b/gi,
];

// Teacher/Student targeting patterns
const teacherPatterns = [
  /\b(teacher|sir|madam|mam|prof|professor|faculty)\s+(is\s+)?(very\s+)?(bad|worst|useless|nalayak|bekaar|ghatiya|faltu|nikamma|bakwas|nonsense|stupid|idiot|dumb|pagal)/gi,
  /(mr|mrs|ms|miss|dr|prof|professor)\s*\.?\s*\w+\s+(is\s+)?(very\s+)?(bad|worst|useless|nalayak|bekaar|ghatiya|stupid|idiot|dumb)/gi,
  /\b(sir|madam|mam)\s+(bahut|very|itna|kitna)?\s*(bad|bekaar|ghatiya|useless|nalayak|pagal|stupid)/gi,
  /\b(padhata|padhati|teaches|teaching)\s+(bahut|very)?\s*(bad|bekaar|ghatiya|badly|poorly|worst)/gi,
  /\b(teacher|sir|madam)\s+(ko|to)?\s*(samajh|aata|nahi|doesnt|dont|know|nothing)/gi,
  /\b(teacher|sir|madam)\s+(bilkul|ekdum)?\s*(faltu|bakwas|bekar|ghatiya|nalayak)/gi,
  
  // Partiality & Favoritism patterns
  /\b(teacher|sir|madam|mam|prof|professor|faculty)\s+.{0,50}\s*(partiality|partial|biased|bias|favour|favou?rs?|favoritism|favouritism)/gi,
  /\b(partiality|partial|biased|bias|favour|favou?rs?|favoritism|favouritism)\s+.{0,30}\s*(in\s+)?(marks|grading|sessional|internal|attendance)/gi,
  /\b(does|do|karta|karti|kar\s+raha|kar\s+rahi)\s+.{0,20}\s*(partiality|favouritism|favoritism|favour|bias)/gi,
  /\bfavou?rs?\s+(girls|boys|students|bachhe|bachhi|ladke|ladki)/gi,
  /\b(girls|boys|students|ladke|ladki)\s+(ko|to)?\s+.{0,20}\s*(favour|extra|zyada|jyada)\s+(marks|numbers|attendance)/gi,
  /\b(marks|numbers|grading|sessional|internal)\s+(me|mein|in)?\s+.{0,30}\s*(partiality|partial|unfair|bias|favour)/gi,
  /\bunfair\s+(marks|grading|marking|sessional|internal|attendance)/gi,
  /\bdiscriminat(e|es|ion|ing)\s+.{0,20}\s*(students|against|between)/gi,
  /\b(teacher|sir|madam)\s+.{0,40}\s*discriminat/gi,
  /\bonly\s+(gives|deta|deti)\s+.{0,20}\s*(good\s+)?marks\s+to\s+(girls|boys|his|her|apne)/gi,
  /\b(gives|deta|deti)\s+(extra|zyada|jyada|more)\s+.{0,20}\s*to\s+(girls|boys|favourites)/gi,
  /\bpakshpaat\b/gi,
  /\b(teacher|sir|madam)\s+.{0,30}\s*(pakshpaat|partiality|favour|taraf\s+daari)/gi,
  /\b(ladke|ladki|girls|boys)\s+ko\s+.{0,20}\s*(zyada|jyada|extra|special)\s+(marks|number|attendance)/gi,
];

const studentPatterns = [
  /\b(student|classmate|batchmate)\s+\w+\s+(is\s+)?(very\s+)?(bad|worst|chutiya|stupid|idiot|dumb|nalayak)/gi,
  /\b(roll|student)\s+(no|number|num)?\s*\.?\s*\d+\s+(is\s+)?(bad|worst|chutiya|stupid|nalayak)/gi,
  /\b\w+\s+(bahut|very|itna)?\s*(bad|bekaar|chutiya|stupid|nalayak|pagal)\s+(hai|student|classmate)/gi,
  /\b(ye|wo|these|those)\s+(students|log|bachhe)\s+(bahut|very)?\s*(bad|bekaar|nalayak|stupid)/gi,
];

const relationshipRumorPatterns = [
  /\b(sir|madam|mam|teacher|prof|professor|faculty|student|classmate|batchmate)\b.{0,40}\b(loves|love|likes|dating|date|affair|relationship|romance|romantic|crush|sleeping\s+with|slept\s+with|hooking\s+up|hookup|flirting|cheating)\b/gi,
  /\b(loves|love|likes|dating|date|affair|relationship|romance|romantic|crush|sleeping\s+with|slept\s+with|hooking\s+up|hookup|flirting|cheating)\b.{0,40}\b(sir|madam|mam|teacher|prof|professor|faculty|student|classmate|batchmate)\b/gi,
  /\b(mr|mrs|ms|miss|dr|prof|professor)\.?\s+\w+\b.{0,50}\b(loves|love|likes|dating|affair|relationship|sleeping\s+with|slept\s+with|hooking\s+up|flirting)\b/gi,
];

// Caste/Category patterns
const castePatterns = [
  /\b(sc|st|obc|general|ews|unreserved)\s+(quota|reservation|category|students?|log)?\s*(is\s+|are\s+|hai\s+|hain\s+)?(bad|unfair|galat|wrong|should|remove|hatao|cancel)/gi,
  /\b(reservation|quota)\s+(is\s+|hai\s+)?(unfair|galat|wrong|bad|bakwas|hatana|remove|cancel)/gi,
  /\b(brahmin|kshatriya|vaishya|shudra|dalit|chamar|jat|jaat|rajput|yadav|bhumihar|kurmi|thakur)\b/gi,
  /\bscheduled\s+(caste|tribe)\b/gi,
  /\b(sc|st|obc)\s+(wale|waale|log|students)\s+(bahut|always|hamesha)?\s*(bad|bekaar|nalayak)/gi,
  /\b(merit|deserving)\s+(vs|versus)?\s*(reservation|quota|sc|st|obc)/gi,
  /\b(reservation|quota)\s+(ke\s+)?(wajah|because|due|karan)\s+(se\s+)?(unfair|galat|problem)/gi,
];

// Sarcasm indicators
const sarcasticPatterns = [
  /\b(wow|great|amazing|superb|fantastic|excellent|kamaal|zabardast|wah)\s+.{0,30}\s*(not|nahi|zero|fail|worst|bad)/gi,
  /\b(genius|talented|brilliant|smart|intelligent|hero|champion)\s+.{0,30}\s*(fail|zero|nothing|kuch\s+nahi)/gi,
  /\b(wah|kya|bahut|zabardast|kamaal)\s+.{0,30}\s*(bakwas|bekaar|faltu|zero|fail)/gi,
  /\b(congratulations|congrats|badhai)\s+.{0,30}\s*(fail|worst|last|zero)/gi,
  /\b(proud|proud\s+of|garv)\s+.{0,30}\s*(fail|worst|shame|sharm)/gi,
];

// Personal attack patterns
const personalAttackPatterns = [
  /\b(tum|tu|you|aap)\s+(bahut|very|itna)?\s*(ugly|ganda|gandi|cheap|characterless|bekar|stupid|idiot|chutiya)/gi,
  /\b(tera|teri|tumhara|tumhari|your)\s+(baap|maa|behen|bhai|papa|mummi|beta|beti)/gi,
  /\b(tum|tu|you)\s+(characterless|besharam|cheap|low|neech)/gi,
  /\bgira\s+hua\b/gi,
  /\b(tum|tu|you|aap)\s+(bahut|very)?\s*(ugly|ganda|fat|mota|patla|kala|kali)/gi,
];

// Gender-based discrimination patterns
const genderDiscriminationPatterns = [
  /\bfavou?rs?\s+(only\s+)?(girls|boys|ladke|ladki)/gi,
  /\b(girls|boys|ladke|ladki)\s+(ko|ko\s+hi|only)?\s+.{0,30}\s*(good\s+marks|zyada\s+marks|extra\s+marks|special\s+treatment)/gi,
  /\b(only|sirf|bas)\s+(girls|boys|ladke|ladki)\s+.{0,30}\s*(get|milte|paate|receive)\s+.{0,20}\s*(good\s+marks|high\s+marks)/gi,
  /\b(boys|girls|ladke|ladki)\s+(never|kabhi\s+nahi|nahi)\s+.{0,20}\s*get\s+(good\s+marks|full\s+marks)/gi,
  /\bdifferent\s+(treatment|behaviour|behavior)\s+.{0,20}\s*(for|towards|to)\s+(girls|boys)/gi,
  /\b(girls|boys)\s+(are|ko)\s+.{0,30}\s*(favoured|preferred|special)/gi,
];

// Positive context patterns (to reduce false positives)
const positiveContextPatterns = [
  /\b(helping|help|supported|supporting|taught|teaching|explaining|studying|learning|practice|practicing)\b/gi,
  /\b(madad|sahayata|sikhana|padhna|samjhana)\b/gi,
  /\b(together|each\s+other|one\s+another|collaboration|team|group|project)\b/gi,
  /\b(saath|ek\s+dusre|mil\s+kar)\b/gi,
  /\b(saw|seen|observed|noticed|found|dekha|dekhi)\s+.{0,40}\s*(helping|studying|working|learning)/gi,
  /\b(assignment|homework|notes|preparation|exam|test|quiz|doubt|question)\b/gi,
];

// Positive indicators
const positiveWords = [
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome", "brilliant",
  "accha", "acha", "shandaar", "kamaal", "zabardast", "best", "badhiya",
  "helpful", "kind", "nice", "smart", "intelligent", "talented", "skilled",
  "mast", "superb", "outstanding", "impressive", "beautiful",
  "helping", "support", "care", "friend", "madad", "dost"
];

// Negation words
const negationPatterns = [
  /\bnot\b/i, /\bnever\b/i, /\bno\b/i, /\bneither\b/i, /\bnor\b/i, /\bnone\b/i, /\bnothing\b/i,
  /\bnahi\b/i, /\bna\b/i, /\bmat\b/i, /\bmana\b/i, /\bbilkul\s+nahi\b/i, /\bkabhi\s+nahi\b/i
];

// ===== HELPER FUNCTIONS =====

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s\*\#\@\!\$\%\.\-\_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeClean(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 🆕 DEOBFUSCATION - strips special chars from WITHIN words to reveal hidden abuse
function deobfuscate(text) {
  return text
    .toLowerCase()
    // Replace common letter substitutions
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    // Remove special characters WITHIN words (keep spaces)
    .replace(/(\w)[\*\#\@\!\$\%\.\-\_\+\=\~\`\^\&]+(\w)/g, '$1$2')
    // Remove remaining special chars
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLanguage(text) {
  const hindiRegex = /[\u0900-\u097F]/;
  const hinglishWords = /(tum|kya|hai|hain|nahi|bhai|yaar|tera|mera|kaise|kya|kyun|kahan)/i;

  if (hindiRegex.test(text)) return "hindi";
  if (hinglishWords.test(text)) return "hinglish";
  return "english";
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check for positive/neutral context
function hasPositiveContext(text) {
  const cleanText = normalizeClean(text);
  
  for (let pattern of positiveContextPatterns) {
    if (cloneRegex(pattern).test(cleanText)) {
      return true;
    }
  }
  
  let positiveWordCount = 0;
  positiveWords.forEach(word => {
    try {
      const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      if (wordRegex.test(cleanText)) {
        positiveWordCount++;
      }
    } catch (e) {}
  });
  
  return positiveWordCount >= 2;
}

// ===== SCORING FUNCTIONS =====

// Keyword-based toxicity scoring
function keywordScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);
  const deobfuscatedText = deobfuscate(text); // 🆕 Check deobfuscated version too
  const originalLower = text.toLowerCase();

  // Check normal abusive words against BOTH clean and deobfuscated text
  abusiveWords.forEach(word => {
    try {
      const escapedWord = escapeRegex(word);
      const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      
      // Check clean text
      const cleanMatches = cleanText.match(wordRegex);
      if (cleanMatches) {
        score += cleanMatches.length * 0.25;
      }
      
      // 🆕 Check deobfuscated text (catches c#utiya -> chutiya etc)
      const deobMatches = deobfuscatedText.match(wordRegex);
      if (deobMatches && !cleanMatches) {
        score += deobMatches.length * 0.35; // Higher score for trying to hide abuse
      }
    } catch (e) {
      console.warn(`Invalid pattern for word: ${word}`);
    }
  });

  // 🆕 Check masked abusive patterns against ORIGINAL text (with special chars)
  maskedAbusivePatterns.forEach(pattern => {
    try {
      const matches = originalLower.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.35;
      }
    } catch (e) {
      console.warn(`Invalid masked pattern`);
    }
  });

  // 🆕 Generic masked abuse (any word with special chars in middle)
  const genericMaskedPattern = /\b[a-zA-Z]+[\*\#\@\!\$\%\.]+[a-zA-Z]+/g;
  const genericMaskedMatches = originalLower.match(genericMaskedPattern);
  if (genericMaskedMatches && genericMaskedMatches.length > 0) {
    // Check if deobfuscated version is abusive
    genericMaskedMatches.forEach(maskedWord => {
      const cleanWord = maskedWord.replace(/[^a-zA-Z]/g, '');
      abusiveWords.forEach(abuseWord => {
        if (cleanWord === abuseWord || cleanWord.includes(abuseWord)) {
          score += 0.4; // High score for intentionally masked abuse
        }
      });
    });
  }

  return Math.min(score, 1);
}

// Teacher/Student targeting detection
function targetingScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);
  const deobfuscatedText = deobfuscate(text);

  [...teacherPatterns, ...studentPatterns].forEach(pattern => {
    try {
      const cleanMatches = cleanText.match(cloneRegex(pattern));
      if (cleanMatches) {
        score += cleanMatches.length * 0.35;
      }
      
      // 🆕 Also check deobfuscated
      const deobMatches = deobfuscatedText.match(cloneRegex(pattern));
      if (deobMatches && !cleanMatches) {
        score += deobMatches.length * 0.4;
      }
    } catch (e) {
      console.warn(`Invalid targeting pattern`);
    }
  });

  return Math.min(score, 1);
}

// Caste/Category detection
function casteScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);

  castePatterns.forEach(pattern => {
    try {
      const matches = cleanText.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.5;
      }
    } catch (e) {
      console.warn(`Invalid caste pattern`);
    }
  });

  return Math.min(score, 1);
}

// Sarcasm detection
function sarcasmScore(text, normalized) {
  let score = 0;

  sarcasticPatterns.forEach(pattern => {
    try {
      const matches = text.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.3;
      }
    } catch (e) {
      console.warn(`Invalid sarcasm pattern`);
    }
  });

  const words = normalized.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (positiveWords.includes(words[i])) {
      const contextStart = Math.max(0, i - 3);
      const contextEnd = Math.min(words.length, i + 4);
      const contextText = words.slice(contextStart, contextEnd).join(' ');
      
      const hasNegation = negationPatterns.some(pattern => pattern.test(contextText));
      if (hasNegation) {
        score += 0.25;
      }
    }
  }

  const excessPunctuation = /[!?]{3,}/g;
  if (excessPunctuation.test(text)) {
    score += 0.15;
  }

  const capsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (capsWords && capsWords.length > 0) {
    score += Math.min(capsWords.length * 0.1, 0.3);
  }

  return Math.min(score, 1);
}

// Personal attack detection
function personalAttackScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);
  const deobfuscatedText = deobfuscate(text); // 🆕

  // Check against clean text
  personalAttackPatterns.forEach(pattern => {
    try {
      const matches = cleanText.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.4;
      }
    } catch (e) {
      console.warn(`Invalid personal attack pattern`);
    }
  });

  // 🆕 Check deobfuscated text for personal attacks
  personalAttackPatterns.forEach(pattern => {
    try {
      const matches = deobfuscatedText.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.45;
      }
    } catch (e) {}
  });

  // 🆕 Direct "tu/tum + abusive word" detection (with deobfuscation)
  const directAttackRegex = /\b(tu|tum|tere|teri|you|aap)\b/gi;
  const hasDirectAddress = directAttackRegex.test(deobfuscatedText);
  
  if (hasDirectAddress) {
    // Check if any abusive word exists in same sentence
    const hasAbuse = abusiveWords.some(word => {
      try {
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
        return regex.test(deobfuscatedText);
      } catch (e) {
        return false;
      }
    });
    
    if (hasAbuse) {
      score += 0.5; // Very high - direct personal abuse
    }
  }

  return Math.min(score, 1);
}

// Gender discrimination detection
function genderDiscriminationScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);

  genderDiscriminationPatterns.forEach(pattern => {
    try {
      const matches = cleanText.match(cloneRegex(pattern));
      if (matches) {
        score += matches.length * 0.4;
      }
    } catch (e) {
      console.warn(`Invalid gender discrimination pattern`);
    }
  });

  const genderWords = /(girls|boys|ladke|ladki|female|male)/gi;
  const biasWords = /(favour|favor|partial|partiality|bias|unfair|discriminat)/gi;
  
  const hasGenderRef = genderWords.test(cleanText);
  const hasBiasRef = biasWords.test(cleanText);
  
  if (hasGenderRef && hasBiasRef) {
    score += 0.3;
  }

  return Math.min(score, 1);
}

function relationshipRumorScore(text) {
  let score = 0;
  const cleanText = normalizeClean(text);
  const deobfuscatedText = deobfuscate(text);

  relationshipRumorPatterns.forEach(pattern => {
    try {
      const cleanMatches = cleanText.match(cloneRegex(pattern));
      if (cleanMatches) {
        score += cleanMatches.length * 0.55;
      }

      const deobMatches = deobfuscatedText.match(cloneRegex(pattern));
      if (deobMatches && !cleanMatches) {
        score += deobMatches.length * 0.6;
      }
    } catch (e) {
      console.warn("Invalid relationship rumor pattern");
    }
  });

  return Math.min(score, 1);
}

// Generate reasons for toxicity
function generateReasons(scores) {
  const reasons = [];

  if (scores.keyword > 0.3) {
    reasons.push("Abusive or offensive language detected");
  }
  if (scores.targeting > 0.3) {
    reasons.push("Potential targeting of teacher/student");
  }
  if (scores.caste > 0.2) {
    reasons.push("Caste/category-related content found");
  }
  if (scores.sarcasm > 0.3) {
    reasons.push("Sarcastic or mocking tone detected");
  }
  if (scores.personalAttack > 0.3) {
    reasons.push("Personal attack detected");
  }
  if (scores.genderDiscrimination > 0.3) {
    reasons.push("Gender-based discrimination or favoritism allegation detected");
  }
  if (scores.relationshipRumor > 0.25) {
    reasons.push("Personal relationship or sexual rumor targeting individuals");
  }

  return reasons;
}

// Suggestions for improvement
function generateSuggestions(scores) {
  const suggestions = [];

  if (scores.keyword > 0.2) {
    suggestions.push("Remove offensive language and use respectful words");
  }
  if (scores.targeting > 0.2) {
    suggestions.push("Avoid making allegations against specific individuals without evidence");
  }
  if (scores.caste > 0.2) {
    suggestions.push("Remove caste/category references - keep discussions inclusive");
  }
  if (scores.sarcasm > 0.2) {
    suggestions.push("Express your thoughts directly without sarcasm");
  }
  if (scores.personalAttack > 0.2) {
    suggestions.push("Focus on ideas, not personal attacks");
  }
  if (scores.genderDiscrimination > 0.2) {
    suggestions.push("Avoid making unverified claims about favoritism or discrimination");
  }
  if (scores.relationshipRumor > 0.2) {
    suggestions.push("Avoid gossip or speculation about personal or intimate relationships");
  }

  return suggestions;
}

function buildToxicityPrompt(text) {
  return [
    "Analyze the following user-generated content for toxicity.",
    "Consider abuse, harassment, hate, threats, bullying, profanity used aggressively, targeted insults, and rumor-spreading about identifiable people.",
    "Treat romantic, sexual, or relationship speculation about teachers, students, classmates, or colleagues as toxic or inappropriate gossip even without profanity.",
    "Return only valid JSON with this exact shape:",
    '{"toxicity": 0.0, "isToxic": false, "reasons": ["short reason"], "suggestions": ["short suggestion"]}',
    "Rules:",
    "- toxicity must be a number from 0 to 1",
    "- isToxic must be true when toxicity > 0.5, otherwise false",
    "- reasons and suggestions must be arrays of short strings",
    "- Do not include markdown or extra explanation",
    "",
    `Content: """${text}"""`
  ].join("\n");
}

function parseAiToxicityResponse(content) {
  if (!content || typeof content !== "string") {
    return null;
  }

  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(jsonText);
    const toxicity = Number(parsed?.toxicity);

    return {
      toxicity: Number.isFinite(toxicity) ? Math.min(Math.max(toxicity, 0), 1) : 0,
      isToxic: typeof parsed?.isToxic === "boolean" ? parsed.isToxic : toxicity > 0.5,
      reasons: Array.isArray(parsed?.reasons)
        ? parsed.reasons.filter((item) => typeof item === "string" && item.trim())
        : [],
      suggestions: Array.isArray(parsed?.suggestions)
        ? parsed.suggestions.filter((item) => typeof item === "string" && item.trim())
        : [],
    };
  } catch (error) {
    return null;
  }
}

function extractAssistantContent(responseBody) {
  const directContent = responseBody?.choices?.[0]?.message?.content;
  if (typeof directContent === "string") {
    return directContent;
  }

  if (Array.isArray(directContent)) {
    return directContent
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .join("")
      .trim();
  }

  if (typeof responseBody?.choices?.[0]?.text === "string") {
    return responseBody.choices[0].text;
  }

  if (typeof responseBody?.output_text === "string") {
    return responseBody.output_text;
  }

  return "";
}

async function getAiToxicityScore(text) {
  const apiKey = getEnvValue("FEATHERLESS_API_KEY", "FETHERLESS_API_KEY");
  if (!apiKey) {
    const err = new Error("Featherless API key is missing. Set FEATHERLESS_API_KEY in backend/.env.");
    err.code = "FEATHERLESS_CONFIG_MISSING";
    throw err;
  }

  if (typeof fetch !== "function") {
    const err = new Error("This Node.js runtime does not provide fetch. Use Node.js 18 or newer.");
    err.code = "FETCH_UNAVAILABLE";
    throw err;
  }

  const apiUrl = getEnvValue("FEATHERLESS_URL", "FETHERLESS_URL") || "https://api.featherless.ai/v1/chat/completions";
  const model = getEnvValue("FEATHERLESS_MODEL", "FETHERLESS_MODEL") || "deepseek-ai/DeepSeek-V3.2";
  const timeoutMs = Number(getEnvValue("FEATHERLESS_TIMEOUT_MS", "FETHERLESS_TIMEOUT_MS")) || 15000;
  const appReferer = getEnvValue("FEATHERLESS_HTTP_REFERER", "APP_URL", "NEXT_PUBLIC_APP_URL");
  const appTitle = getEnvValue("FEATHERLESS_APP_TITLE", "APP_NAME") || "TeaTalks";

  const response = await withBackoff(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(appReferer ? { "HTTP-Referer": appReferer } : {}),
          ...(appTitle ? { "X-Title": appTitle } : {})
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are an expert moderation assistant that detects toxicity in user-generated content and responds with strict JSON only."
            },
            {
              role: "user",
              content: buildToxicityPrompt(text)
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        }),
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        const err = new Error(`Featherless API timed out after ${timeoutMs}ms`);
        err.code = "FEATHERLESS_TIMEOUT";
        throw err;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      const err = new Error(`Featherless API error: ${res.status}`);
      err.status = res.status;
      err.details = errorBody;
      throw err;
    }

    return res.json();
  }, { retries: 1, baseDelayMs: 250 });

  const content = extractAssistantContent(response);
  const parsed = parseAiToxicityResponse(content);

  if (!parsed) {
    const err = new Error("Featherless returned an invalid moderation response");
    err.details = content;
    throw err;
  }

  return parsed;
}

// ===== MAIN FUNCTION =====

async function detectToxicity(text) {
  if (!text || typeof text !== 'string') {
    throw new Error("Text is required and must be a string");
  }

  if (text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  const normalized = normalize(text);
  const cleanNormalized = normalizeClean(text);
  const deobfuscatedText = deobfuscate(text);
  const language = detectLanguage(text);

  // Check for positive context
  const isPositiveContext = hasPositiveContext(text);

  // Calculate individual scores
  const scores = {
    keyword: keywordScore(text),           // 🆕 Pass original text (deobfuscation inside)
    targeting: targetingScore(text),        // 🆕 Pass original text
    caste: casteScore(cleanNormalized),
    sarcasm: sarcasmScore(text, cleanNormalized),
    personalAttack: personalAttackScore(text), // 🆕 Pass original text
    genderDiscrimination: genderDiscriminationScore(cleanNormalized),
    relationshipRumor: relationshipRumorScore(text)
  };

  // Weights for different categories
  const weights = {
    keyword: 0.35,
    targeting: 0.35,
    caste: 0.45,
    sarcasm: 0.20,
    personalAttack: 0.35,
    genderDiscrimination: 0.40,
    relationshipRumor: 0.50
  };

  // Calculate local weighted score
  let localWeightedScore = 0;
  let totalWeight = 0;

  Object.keys(scores).forEach(key => {
    if (scores[key] > 0) {
      localWeightedScore += scores[key] * weights[key];
      totalWeight += weights[key];
    }
  });

  let localScore = totalWeight > 0 ? localWeightedScore / totalWeight : 0;

  // 🆕 BOOST: If deobfuscated text reveals hidden abuse, boost the score
  const hasHiddenAbuse = abusiveWords.some(word => {
    try {
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      return regex.test(deobfuscatedText) && !regex.test(cleanNormalized);
    } catch (e) {
      return false;
    }
  });

  if (hasHiddenAbuse) {
    localScore = Math.max(localScore, 0.7); // Force high score for hidden abuse
  }

  // Reduce score if positive context detected (but NOT if abuse is detected)
  if (isPositiveContext && localScore > 0 && !hasHiddenAbuse && scores.keyword < 0.3) {
    localScore = localScore * 0.3;
  }

  // AI-based detection (with fallback)
  let aiScore = 0;
  let aiError = null;
  let aiErrorCode = null;
  let aiIsToxic = false;
  let aiReasons = [];
  let aiSuggestions = [];

  try {
    const aiResponse = await getAiToxicityScore(text);
    aiScore = aiResponse.toxicity;
    aiIsToxic = aiResponse.isToxic;
    aiReasons = aiResponse.reasons;
    aiSuggestions = aiResponse.suggestions;
  } catch (err) {
    aiError = err.message;
    aiErrorCode = err.code || null;
    console.error("AI toxicity detection failed:", err.message);
  }

  // Combine scores
  let finalScore = aiError 
    ? localScore 
    : Math.max(localScore, aiScore);

  // 🆕 Force toxic if hidden abuse detected
  if (hasHiddenAbuse) {
    finalScore = Math.max(finalScore, 0.7);
  }

  const isToxic = hasHiddenAbuse || localScore > 0.5 || (!aiError && (aiIsToxic || aiScore > 0.5)) || finalScore > 0.5;

  const reasons = [
    ...generateReasons(scores),
    ...aiReasons
  ].filter((value, index, array) => array.indexOf(value) === index);

  const suggestions = [
    ...generateSuggestions(scores),
    ...aiSuggestions
  ].filter((value, index, array) => array.indexOf(value) === index);

  return {
    original: text,
    normalized: cleanNormalized,
    deobfuscated: deobfuscatedText,  // 🆕 For debugging
    language,
    score: parseFloat(finalScore.toFixed(2)),
    aiScore: parseFloat(aiScore.toFixed(2)),
    localScore: parseFloat(localScore.toFixed(2)),
    isPositiveContext,
    hasHiddenAbuse, 
    // breakdown: {
    //   keyword: parseFloat(scores.keyword.toFixed(2)),
    //   targeting: parseFloat(scores.targeting.toFixed(2)),
    //   caste: parseFloat(scores.caste.toFixed(2)),
    //   sarcasm: parseFloat(scores.sarcasm.toFixed(2)),
    //   personalAttack: parseFloat(scores.personalAttack.toFixed(2)),
    //   genderDiscrimination: parseFloat(scores.genderDiscrimination.toFixed(2))
    // },
    isToxic,
    reasons: reasons.length > 0 ? reasons : (isToxic ? ["General negative sentiment detected"] : []),
    suggestions: suggestions.length > 0 ? suggestions : [],
    aiError: aiError || null,
    aiErrorCode
  };
}

module.exports = { detectToxicity };
