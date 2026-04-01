const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4o-mini";

const LANGUAGE_NAMES = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  ml: "Malayalam"
};

const translationCache = new Map();

function getOpenAiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || "";
}

function getLibreTranslateUrl() {
  return (
    process.env.REACT_APP_LIBRETRANSLATE_URL ||
    process.env.LIBRETRANSLATE_URL ||
    ""
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

function cacheKey(text, targetLanguage) {
  return `${normalizeLang(targetLanguage)}::${String(text || "").trim()}`;
}

async function translateWithLibreTranslate(text, targetLanguage) {
  const url = getLibreTranslateUrl();
  if (!url) throw new Error("libretranslate-url-missing");

  const body = {
    q: text,
    target: normalizeLang(targetLanguage),
    format: "text"
  };

  const apiKey = getLibreTranslateKey();
  if (apiKey) body.api_key = apiKey;

  const response = await fetch(url, {
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

export async function translateChatText(text, targetLanguage) {
  const rawText = String(text || "").trim();
  const normalizedTarget = normalizeLang(targetLanguage);

  if (!rawText) return "";
  if (normalizedTarget === "en" && /^[\x00-\x7F\s.,!?'"():;/\\-]+$/.test(rawText)) {
    return rawText;
  }

  const key = cacheKey(rawText, normalizedTarget);
  if (translationCache.has(key)) {
    return translationCache.get(key);
  }

  try {
    const translated = await translateWithLibreTranslate(rawText, normalizedTarget);
    const finalText = translated || rawText;
    translationCache.set(key, finalText);
    return finalText;
  } catch {
    try {
      const translated = await translateWithOpenAi(rawText, normalizedTarget);
      const finalText = translated || rawText;
      translationCache.set(key, finalText);
      return finalText;
    } catch {
      translationCache.set(key, rawText);
      return rawText;
    }
  }
}
