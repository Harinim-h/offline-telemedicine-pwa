const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4o-mini";

function getApiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || "";
}

function parseAiText(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("ai-empty-response");

  try {
    const parsed = JSON.parse(raw);
    return {
      issue: parsed.issue || "General non-specific symptoms",
      naturalRemedy:
        parsed.naturalRemedy ||
        "Hydrate, rest, and take light nutritious food.",
      doctorAdvice:
        parsed.doctorAdvice ||
        "Contact a doctor if symptoms persist or worsen.",
      advice:
        parsed.advice ||
        "Monitor symptoms and consult a doctor if symptoms persist or worsen.",
      confidence: parsed.confidence || "low",
      serious: Boolean(parsed.serious),
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : []
    };
  } catch {
    return {
      issue: "General non-specific symptoms",
      naturalRemedy: "Hydrate, rest, and take light nutritious food.",
      doctorAdvice: "Contact a doctor if symptoms persist or worsen.",
      advice: raw,
      confidence: "low",
      serious: false,
      redFlags: []
    };
  }
}

export async function analyzeSymptomsWithAI({ symptomText, imageDataUrl }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("openai-key-missing");
  if (!navigator.onLine) throw new Error("offline-no-ai");

  const input = [
    {
      role: "system",
      content:
        "You are a cautious triage assistant. Return ONLY JSON with keys: issue, naturalRemedy, doctorAdvice, advice, confidence, serious, redFlags. Keep output concise and safe. Do not claim diagnosis certainty."
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Symptoms from patient: ${String(symptomText || "").trim() || "No text provided"}`
        },
        ...(imageDataUrl
          ? [{ type: "input_image", image_url: imageDataUrl }]
          : []),
        {
          type: "input_text",
          text: "confidence must be one of: low, medium, high. serious must be true for emergency patterns. redFlags should be an array of urgent warning signs if any."
        }
      ]
    }
  ];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: 220
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`openai-error:${response.status}:${errText}`);
  }

  const data = await response.json();
  const outputText = data?.output_text || "";
  return parseAiText(outputText);
}
