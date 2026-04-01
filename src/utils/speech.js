export const LANGUAGE_MAP = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  ml: "ml-IN"
};

export function getSpeechLang(lang) {
  return LANGUAGE_MAP[String(lang || "").toLowerCase()] || "en-US";
}

function pickVoice(langCode) {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices() || [];
  if (voices.length === 0) return null;

  const target = String(langCode || "en-US").toLowerCase();
  const base = target.split("-")[0];

  return (
    voices.find((v) => String(v.lang || "").toLowerCase() === target) ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith(`${base}-`)) ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith(base)) ||
    voices.find((v) => String(v.default).toLowerCase() === "true") ||
    voices[0]
  );
}

function buildUtterance(message, langCode) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voice = pickVoice(langCode);
  if (voice) utterance.voice = voice;
  return utterance;
}

export function speakText(text, lang) {
  if (!("speechSynthesis" in window)) return;
  const message = String(text || "").trim();
  if (!message) return;
  const langCode = getSpeechLang(lang);
  const synth = window.speechSynthesis;

  synth.cancel();
  synth.resume();

  const speakNow = () => {
    const utterance = buildUtterance(message, langCode);
    synth.speak(utterance);
  };

  if ((synth.getVoices() || []).length > 0) {
    speakNow();
    return;
  }

  let didSpeak = false;
  const onVoicesChanged = () => {
    if (didSpeak) return;
    didSpeak = true;
    synth.removeEventListener("voiceschanged", onVoicesChanged);
    speakNow();
  };

  synth.addEventListener("voiceschanged", onVoicesChanged);
  setTimeout(() => {
    if (didSpeak) return;
    didSpeak = true;
    synth.removeEventListener("voiceschanged", onVoicesChanged);
    speakNow();
  }, 250);
}
