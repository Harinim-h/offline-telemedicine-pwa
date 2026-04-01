import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "src", "locales");
const SOURCE_LOCALE = "en";

const SOURCE_LANGUAGE_CODE = "en";
const TARGET_LANGUAGE_CODES = {
  ta: "ta",
  hi: "hi",
  ml: "ml"
};

const endpoint = String(
  process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000/translate"
).trim();
const apiKey = String(process.env.LIBRETRANSLATE_API_KEY || "").trim();

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function shouldTranslate(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getNestedValue(obj, keyPath) {
  return keyPath.reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, keyPath, value) {
  let cursor = obj;
  for (let i = 0; i < keyPath.length - 1; i += 1) {
    const key = keyPath[i];
    if (!isPlainObject(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[keyPath[keyPath.length - 1]] = value;
}

function collectStringPaths(obj, basePath = []) {
  const paths = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextPath = [...basePath, key];
    if (shouldTranslate(value)) {
      paths.push(nextPath);
      continue;
    }
    if (isPlainObject(value)) {
      paths.push(...collectStringPaths(value, nextPath));
    }
  }
  return paths;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  const formatted = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, formatted, "utf8");
}

async function translateText(text, targetLanguage) {
  const payload = {
    q: text,
    source: SOURCE_LANGUAGE_CODE,
    target: targetLanguage,
    format: "text"
  };

  if (apiKey) {
    payload.api_key = apiKey;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return String(result.translatedText || "").trim();
}

async function translateLocale(targetLocale) {
  const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);
  const targetPath = path.join(LOCALES_DIR, `${targetLocale}.json`);
  const sourceJson = await readJson(sourcePath);
  const targetJson = await readJson(targetPath);
  const targetLanguage = TARGET_LANGUAGE_CODES[targetLocale];

  if (!targetLanguage) {
    throw new Error(`Unsupported target locale: ${targetLocale}`);
  }

  const sourcePaths = collectStringPaths(sourceJson);
  let translatedCount = 0;

  for (const keyPath of sourcePaths) {
    const sourceValue = getNestedValue(sourceJson, keyPath);
    const existingValue = getNestedValue(targetJson, keyPath);
    if (!shouldTranslate(sourceValue)) {
      continue;
    }
    if (shouldTranslate(existingValue)) {
      continue;
    }

    const translatedText = await translateText(sourceValue, targetLanguage);
    if (!translatedText) {
      continue;
    }
    setNestedValue(targetJson, keyPath, translatedText);
    translatedCount += 1;
    console.log(`[${targetLocale}] ${keyPath.join(".")}`);
  }

  await writeJson(targetPath, targetJson);
  console.log(`Finished ${targetLocale}: ${translatedCount} new translations.`);
}

async function main() {
  const requestedLocales = process.argv.slice(2);
  const locales =
    requestedLocales.length > 0
      ? requestedLocales
      : Object.keys(TARGET_LANGUAGE_CODES);

  console.log(`Using LibreTranslate endpoint: ${endpoint}`);
  for (const locale of locales) {
    await translateLocale(locale);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
