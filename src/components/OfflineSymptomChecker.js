import React, { useMemo, useState } from "react";
import { analyzeSymptomsWithAI } from "../services/aiSymptomService";

const HISTORY_KEY = "offline_symptom_checks_v1";

const SYMPTOM_RULES = [
  {
    keywords: ["fever", "high temperature", "chills", "body pain", "fatigue"],
    disease: "Viral Fever",
    naturalRemedy: "Drink warm fluids, take adequate rest, and monitor temperature regularly.",
    doctorAdvice: "Contact a doctor if fever is above 102F or lasts more than 2 days.",
    severity: "moderate"
  },
  {
    keywords: ["cold", "cough", "sore throat", "runny nose", "sneezing", "blocked nose"],
    disease: "Common Cold / Upper Respiratory Infection",
    naturalRemedy: "Steam inhalation, warm water with honey and ginger, and good hydration.",
    doctorAdvice: "See a doctor if breathing difficulty, chest pain, or high fever appears.",
    severity: "mild"
  },
  {
    keywords: ["headache", "migraine", "light sensitivity", "nausea", "one side pain"],
    disease: "Tension Headache / Migraine",
    naturalRemedy: "Rest in a dark quiet room, drink water, and avoid known triggers.",
    doctorAdvice: "Consult a doctor if severe repeated headaches or vision changes occur.",
    severity: "mild"
  },
  {
    keywords: ["stomach pain", "vomit", "diarrhea", "food poisoning", "loose motion", "abdominal pain"],
    disease: "Gastroenteritis / Food Poisoning",
    naturalRemedy: "Use ORS, soft foods, coconut water, and avoid oily or spicy meals.",
    doctorAdvice: "See a doctor if blood in stool, persistent vomiting, or dehydration signs occur.",
    severity: "moderate"
  },
  {
    keywords: ["rash", "itching", "red patch", "skin allergy", "hives", "skin redness"],
    disease: "Skin Allergy / Dermatitis",
    naturalRemedy: "Keep skin cool and dry, use gentle moisturizer, avoid irritant products.",
    doctorAdvice: "Consult dermatologist if rash spreads quickly, oozes, or causes swelling.",
    severity: "mild"
  },
  {
    keywords: ["chest pain", "breathless", "shortness of breath", "tight chest", "left arm pain"],
    disease: "Possible Cardio-Respiratory Emergency",
    naturalRemedy: "No home remedy advised for this pattern.",
    doctorAdvice: "Immediate emergency care required.",
    severity: "high"
  }
];

const RED_FLAG_KEYWORDS = [
  "severe chest pain",
  "shortness of breath",
  "breathing difficulty",
  "fainted",
  "confusion",
  "unconscious",
  "blood vomiting",
  "blood in stool",
  "high fever 103",
  "seizure",
  "stroke"
];

export default function OfflineSymptomChecker() {
  const [symptomText, setSymptomText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageConfidence, setImageConfidence] = useState("low");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engine, setEngine] = useState("on-device-ai");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const onlineStatus = navigator.onLine ? "Online" : "Offline";
  const statusColor = navigator.onLine ? "#0d8f56" : "#b23a3a";
  const symptomSummary = useMemo(() => history.slice(0, 3), [history]);

  function scoreText(text) {
    const input = String(text || "").toLowerCase().trim();
    if (!input) return [];
    return SYMPTOM_RULES.map((rule) => {
      let score = 0;
      for (const word of rule.keywords) {
        if (input.includes(word)) score += 1;
      }
      return { ...rule, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function hasRedFlag(text) {
    const input = String(text || "").toLowerCase().trim();
    return RED_FLAG_KEYWORDS.some((word) => input.includes(word));
  }

  function buildOfflineDiagnosis(text) {
    const ranked = scoreText(text);
    const top = ranked[0];
    const redFlag = hasRedFlag(text) || top?.severity === "high";

    if (!top) {
      return {
        disease: "Non-specific symptom pattern",
        naturalRemedy: "Hydrate, light nutritious food, and adequate rest.",
        doctorAdvice: "If symptoms continue beyond 24-48 hours, contact a doctor.",
        confidence: "low",
        serious: false,
        redFlags: []
      };
    }

    const confidence = top.score >= 3 ? "high" : top.score === 2 ? "medium" : "low";
    return {
      disease: top.disease,
      naturalRemedy: top.naturalRemedy,
      doctorAdvice: redFlag
        ? "Serious symptom pattern detected. Contact doctor immediately."
        : top.doctorAdvice,
      confidence,
      serious: redFlag,
      redFlags: redFlag ? ["Potential emergency pattern"] : []
    };
  }

  async function analyzeImage(file) {
    if (!file) return { hint: "No image uploaded." };
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setImageDataUrl(String(dataUrl));
    setImageName(file.name || "uploaded-image");

    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = String(dataUrl);
    });

    const canvas = document.createElement("canvas");
    const width = 100;
    const ratio = image.width ? image.height / image.width : 1;
    const height = Math.max(50, Math.floor(width * ratio));
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const avgR = r / pixels;
    const avgG = g / pixels;
    const avgB = b / pixels;
    const rednessScore = avgR - (avgG + avgB) / 2;
    const brightness = (avgR + avgG + avgB) / 3;
    const fileName = String(file.name || "").toLowerCase();

    if (fileName.includes("rash") || fileName.includes("skin")) {
      return { hint: "Image name suggests a skin issue. Possible rash/allergy pattern.", confidence: "medium" };
    }
    if (rednessScore > 18) {
      return { hint: "Image has higher red-tone areas. Could match irritation/rash/inflammation.", confidence: "low" };
    }
    if (brightness < 70) {
      return { hint: "Image is quite dark; details are limited. Capture in better light.", confidence: "low" };
    }
    return { hint: "No clear visual pattern detected from offline image heuristic.", confidence: "low" };
  }

  async function runChecker() {
    if (!symptomText.trim() && !imageDataUrl) {
      alert("Enter symptom text or upload an image first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const offline = buildOfflineDiagnosis(symptomText);
      let output = {
        issue: offline.disease,
        disease: offline.disease,
        naturalRemedy: offline.naturalRemedy,
        doctorAdvice: offline.doctorAdvice,
        advice: `${offline.naturalRemedy} ${offline.doctorAdvice}`.trim(),
        confidence: offline.confidence,
        serious: offline.serious,
        redFlags: offline.redFlags || [],
        imageHint: imageHint || "",
        imageConfidence,
        createdAt: Date.now()
      };

      try {
        const ai = await analyzeSymptomsWithAI({ symptomText, imageDataUrl });
        output = {
          issue: ai.issue,
          disease: ai.issue,
          naturalRemedy: ai.naturalRemedy || offline.naturalRemedy,
          doctorAdvice: ai.doctorAdvice || offline.doctorAdvice,
          advice: ai.advice,
          confidence: ai.confidence,
          serious: Boolean(ai.serious) || offline.serious,
          redFlags: ai.redFlags || offline.redFlags || [],
          imageHint: imageHint || "",
          imageConfidence,
          createdAt: Date.now()
        };
        setEngine("ai");
      } catch {
        setEngine("on-device-ai");
      }

      const nextHistory = [output, ...history].slice(0, 20);
      setResult(output);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAnalyzing(true);
      const imageResult = await analyzeImage(file);
      setImageHint(imageResult.hint);
      setImageConfidence(imageResult.confidence || "low");
    } catch {
      alert("Unable to process image offline.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div style={checkerBox}>
      <p style={{ ...statusPill, background: statusColor }}>{onlineStatus} Mode</p>
      <p style={checkerMeta}>
        On-device AI works fully offline and on any device running this app. Online AI is used when available for better accuracy.
      </p>
      <textarea
        placeholder="Type symptoms (example: fever, cough, sore throat for 2 days)"
        value={symptomText}
        onChange={(e) => setSymptomText(e.target.value)}
        style={textArea}
      />
      <div style={uploadRow}>
        <input type="file" accept="image/*" onChange={onImageChange} />
        {imageName ? <span style={smallText}>Image: {imageName}</span> : null}
      </div>
      {imageDataUrl ? <img src={imageDataUrl} alt="symptom upload" style={preview} /> : null}
      <button style={checkBtn} onClick={runChecker} disabled={isAnalyzing}>
        {isAnalyzing ? "Analyzing..." : "Check Symptom Offline"}
      </button>

      {result ? (
        <div style={resultCard}>
          <h4 style={{ margin: "0 0 8px" }}>Result</h4>
          <p style={resultText}><strong>Engine:</strong> {engine === "ai" ? "AI (OpenAI)" : "On-device Offline AI"}</p>
          <p style={resultText}><strong>Probable disease:</strong> {result.disease || result.issue || "-"}</p>
          <p style={resultText}><strong>Natural remedy:</strong> {result.naturalRemedy || "-"}</p>
          <p style={resultText}><strong>Doctor guidance:</strong> {result.doctorAdvice || "-"}</p>
          <p style={resultText}><strong>Confidence:</strong> {result.confidence || "low"}</p>
          {result.serious ? <p style={seriousText}>Serious symptoms detected: Contact doctor now.</p> : null}
          {Array.isArray(result.redFlags) && result.redFlags.length > 0 ? (
            <p style={resultText}><strong>Red flags:</strong> {result.redFlags.join(", ")}</p>
          ) : null}
          {result.imageHint ? (
            <p style={resultText}>
              <strong>Image hint:</strong> {result.imageHint} ({result.imageConfidence || "low"} confidence)
            </p>
          ) : null}
          <p style={warningText}>
            Emergency signs like severe chest pain, breathing trouble, confusion, or persistent high fever need immediate hospital care.
          </p>
        </div>
      ) : null}

      {symptomSummary.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: "0 0 8px", color: "#203a43" }}>Recent Checks</h4>
          {symptomSummary.map((item) => (
            <div key={item.createdAt} style={historyItem}>
              <strong>{item.issue}</strong>
              <p style={{ margin: "4px 0" }}>{item.advice}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const statusPill = {
  display: "inline-block",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: 600,
  marginBottom: 10
};

const checkerBox = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
};

const checkerMeta = {
  marginTop: 0,
  fontSize: 13,
  color: "#32535d"
};

const textArea = {
  width: "100%",
  minHeight: 110,
  resize: "vertical",
  borderRadius: 10,
  border: "1px solid #b7cdd3",
  padding: 10,
  fontSize: 14
};

const uploadRow = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap"
};

const smallText = {
  fontSize: 12,
  color: "#355b66"
};

const preview = {
  marginTop: 10,
  width: "100%",
  maxHeight: 240,
  objectFit: "cover",
  borderRadius: 10,
  border: "1px solid #d4e5ea"
};

const checkBtn = {
  marginTop: 12,
  border: "none",
  background: "#1f6f8b",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600
};

const resultCard = {
  marginTop: 12,
  border: "1px solid #c9e0e6",
  background: "#f3fcff",
  borderRadius: 10,
  padding: 12
};

const resultText = {
  margin: "6px 0",
  color: "#163e49"
};

const warningText = {
  margin: "8px 0 0",
  color: "#9b2c2c",
  fontWeight: 600,
  fontSize: 13
};

const seriousText = {
  margin: "8px 0 0",
  color: "#b00020",
  fontWeight: 700
};

const historyItem = {
  border: "1px solid #d2e6ec",
  borderRadius: 8,
  padding: 10,
  marginBottom: 8,
  background: "#ffffff"
};
