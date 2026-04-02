const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4o-mini";

const LANGUAGE_NAMES = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  ml: "Malayalam"
};

const translationCache = new Map();
const REQUEST_TIMEOUT_MS = 6000;

function getOpenAiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || "";
}

function getTranslateProxyUrl() {
  return process.env.REACT_APP_TRANSLATE_PROXY_URL || "";
}

function getLibreTranslateUrl() {
  return (
    process.env.REACT_APP_LIBRETRANSLATE_URL ||
    process.env.LIBRETRANSLATE_URL ||
    "https://libretranslate.de/translate"
  );
}

function getLibreTranslateKey() {
  return (
    process.env.REACT_APP_LIBRETRANSLATE_API_KEY ||
    process.env.LIBRETRANSLATE_API_KEY ||
    ""
  );
}

function normalizeLang(lang) {
  const value = String(lang || "en").toLowerCase();
  return LANGUAGE_NAMES[value] ? value : value.split("-")[0];
}

function detectSourceLang(text) {
  const raw = String(text || "");
  if (/[\u0B80-\u0BFF]/.test(raw)) return "ta";
  if (/[\u0D00-\u0D7F]/.test(raw)) return "ml";
  if (/[\u0900-\u097F]/.test(raw)) return "hi";
  return "en";
}

function cacheKey(text, targetLanguage) {
  return `${normalizeLang(targetLanguage)}::${String(text || "").trim()}`;
}

function getLibreTranslateCandidates() {
  const primary = getLibreTranslateUrl();
  const fallbacks = [
    "https://libretranslate.de/translate",
    "https://translate.astian.org/translate"
  ];

  return [primary, ...fallbacks].filter(Boolean);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateWithProxy(text, targetLanguage, sourceLanguage) {
  const url = getTranslateProxyUrl();
  if (!url) throw new Error("translate-proxy-missing");

  const body = {
    q: text,
    source: sourceLanguage || "auto",
    target: normalizeLang(targetLanguage),
    format: "text"
  };

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`translate-proxy-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.translatedText || data?.text || "").trim();
}

async function translateWithLibreTranslate(text, targetLanguage, sourceLanguage, url) {
  if (!url) throw new Error("libretranslate-url-missing");

  const body = {
    q: text,
    source: sourceLanguage || "auto",
    target: normalizeLang(targetLanguage),
    format: "text"
  };

  const apiKey = getLibreTranslateKey();
  if (apiKey) body.api_key = apiKey;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`libretranslate-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.translatedText || "").trim();
}

async function translateWithOpenAi(text, targetLanguage) {
  const apiKey = getOpenAiKey();
  if (!apiKey) throw new Error("openai-key-missing");

  const languageName =
    LANGUAGE_NAMES[normalizeLang(targetLanguage)] || "English";

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            `Translate the user's message into ${languageName}. Return only the translated text. Keep names, codes, numbers, and medical meaning unchanged.`
        },
        {
          role: "user",
          content: [{ type: "input_text", text }]
        }
      ],
      max_output_tokens: 300
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.output_text || "").trim();
}

async function translateWithGoogle(text, targetLanguage) {
  const target = normalizeLang(targetLanguage);
  const source = detectSourceLang(text);
  const query = encodeURIComponent(text);
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${query}`;

  const response = await fetchWithTimeout(url, { method: "GET" });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`google-translate-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const translated = parts.map((p) => p?.[0]).filter(Boolean).join("");
  return String(translated || "").trim();
}

async function translateWithMyMemory(text, targetLanguage) {
  const source = detectSourceLang(text);
  const target = normalizeLang(targetLanguage);
  if (source === target) return String(text || "").trim();
  const query = encodeURIComponent(text);
  const response = await fetchWithTimeout(
    `https://api.mymemory.translated.net/get?q=${query}&langpair=${source}|${target}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`mymemory-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.responseData?.translatedText || "").trim();
}

export async function translateChatTextWithMeta(text, targetLanguage) {
  const rawText = String(text || "").trim();
  const normalizedTarget = normalizeLang(targetLanguage);
  const source = detectSourceLang(rawText);

  if (!rawText) return { text: "", provider: "none" };
  if (!navigator.onLine) return { text: rawText, provider: "offline" };
  if (source === normalizedTarget) return { text: rawText, provider: "same-language" };
  if (normalizedTarget === "en" && /^[\x00-\x7F\s.,!?'"():;/\\-]+$/.test(rawText)) {
    return { text: rawText, provider: "ascii-english" };
  }

  const key = cacheKey(rawText, normalizedTarget);
  if (translationCache.has(key)) {
    return { text: translationCache.get(key), provider: "cache" };
  }

  try {
    const translated = await translateWithProxy(rawText, normalizedTarget, source);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "proxy" };
    }
  } catch {
    // fall through to LibreTranslate
  }

  try {
    const candidates = getLibreTranslateCandidates();
    let translated = "";

    for (const url of candidates) {
      try {
        translated = await translateWithLibreTranslate(
          rawText,
          normalizedTarget,
          source,
          url
        );
        if (translated) break;
      } catch {
        // try next endpoint
      }
    }

    if (translated) {
      translationCache.set(key, translated);
      return { text: translated, provider: "libretranslate" };
    }
  } catch {
    // fall through to OpenAI
  }

  try {
    const translated = await translateWithMyMemory(rawText, normalizedTarget);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "mymemory" };
    }
  } catch {
    // fall through to next provider
  }

  try {
    const translated = await translateWithGoogle(rawText, normalizedTarget);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "google" };
    }
  } catch {
    // fall through to OpenAI
  }

  try {
    const translated = await translateWithOpenAi(rawText, normalizedTarget);
    if (translated) {
      translationCache.set(key, translated);
      return { text: translated, provider: "openai" };
    }
  } catch {
    // ignore
  }

  // Do not cache failures so we can retry on the next refresh.
  return { text: rawText, provider: "fallback" };
}

export async function translateChatText(text, targetLanguage) {
  const result = await translateChatTextWithMeta(text, targetLanguage);
  return result.text;
}
