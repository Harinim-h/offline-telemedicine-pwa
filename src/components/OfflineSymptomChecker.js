import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeSymptomsWithAI } from "../services/aiSymptomService";
import { buildClinicalAIResult } from "../services/clinicalModels";
import { useTranslation } from "react-i18next";
import SpeakableText from "./SpeakableText";
import { getSpeechLang, speakText as speakTextGlobal } from "../utils/speech";

const HISTORY_KEY = "offline_symptom_checks_v1";

const SYMPTOM_RULES = [
  {
    keywords: ["fever", "high temperature", "chills", "body pain", "fatigue"],
    diseaseKey: "symptom_rule_viral_fever_disease",
    naturalRemedyKey: "symptom_rule_viral_fever_remedy",
    doctorAdviceKey: "symptom_rule_viral_fever_advice",
    severity: "moderate"
  },
  {
    keywords: ["cold", "cough", "sore throat", "runny nose", "sneezing", "blocked nose"],
    diseaseKey: "symptom_rule_cold_disease",
    naturalRemedyKey: "symptom_rule_cold_remedy",
    doctorAdviceKey: "symptom_rule_cold_advice",
    severity: "mild"
  },
  {
    keywords: ["headache", "migraine", "light sensitivity", "nausea", "one side pain"],
    diseaseKey: "symptom_rule_headache_disease",
    naturalRemedyKey: "symptom_rule_headache_remedy",
    doctorAdviceKey: "symptom_rule_headache_advice",
    severity: "mild"
  },
  {
    keywords: ["stomach pain", "vomit", "diarrhea", "food poisoning", "loose motion", "abdominal pain"],
    diseaseKey: "symptom_rule_gastro_disease",
    naturalRemedyKey: "symptom_rule_gastro_remedy",
    doctorAdviceKey: "symptom_rule_gastro_advice",
    severity: "moderate"
  },
  {
    keywords: ["rash", "itching", "red patch", "skin allergy", "hives", "skin redness"],
    diseaseKey: "symptom_rule_skin_disease",
    naturalRemedyKey: "symptom_rule_skin_remedy",
    doctorAdviceKey: "symptom_rule_skin_advice",
    severity: "mild"
  },
  {
    keywords: ["chest pain", "breathless", "shortness of breath", "tight chest", "left arm pain"],
    diseaseKey: "symptom_rule_cardio_disease",
    naturalRemedyKey: "symptom_rule_cardio_remedy",
    doctorAdviceKey: "symptom_rule_cardio_advice",
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

const CONDITION_LABEL_KEY = {
  viral_fever: "condition_viral_fever",
  cold_cough: "condition_cold_cough",
  migraine_headache: "condition_migraine_headache",
  gastro_issue: "condition_gastro_issue",
  skin_allergy: "condition_skin_allergy",
  cardio_respiratory: "condition_cardio_respiratory"
};

function formatConditionLabel(label, t) {
  const key = String(label || "").trim();
  if (!key) return t("condition_general_non_specific", "General non-specific symptoms");
  const translationKey = CONDITION_LABEL_KEY[key];
  if (translationKey) return t(translationKey);
  return key.replace(/_/g, " ");
}

export default function OfflineSymptomChecker() {
  const { i18n, t } = useTranslation();
  const [symptomText, setSymptomText] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageConfidence, setImageConfidence] = useState("low");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [engine, setEngine] = useState("on-device-ai");
  const recognitionRef = useRef(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const onlineStatus = navigator.onLine ? t("video_call_online") : t("video_call_offline");
  const statusColor = navigator.onLine ? "#0d8f56" : "#b23a3a";
  const symptomSummary = useMemo(() => history.slice(0, 3), [history]);
  const speechLang = useMemo(() => {
    return getSpeechLang(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speakText(message) {
    speakTextGlobal(message, i18n.language);
  }

  function startSymptomVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setSymptomText((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }

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

  function translateRule(rule) {
    return {
      ...rule,
      disease: t(rule.diseaseKey),
      naturalRemedy: t(rule.naturalRemedyKey),
      doctorAdvice: t(rule.doctorAdviceKey)
    };
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
        disease: t("symptom_generic_disease"),
        naturalRemedy: t("symptom_generic_remedy"),
        doctorAdvice: t("symptom_generic_advice"),
        confidence: "low",
        serious: false,
        redFlags: []
      };
    }

    const localizedTop = translateRule(top);
    const confidence = top.score >= 3 ? "high" : top.score === 2 ? "medium" : "low";
    return {
      disease: localizedTop.disease,
      naturalRemedy: localizedTop.naturalRemedy,
      doctorAdvice: redFlag
        ? t("symptom_serious_pattern_advice")
        : localizedTop.doctorAdvice,
      confidence,
      serious: redFlag,
      redFlags: redFlag ? [t("symptom_potential_emergency_pattern")] : []
    };
  }

  async function analyzeImage(file) {
    if (!file) return { hint: t("symptom_no_image_uploaded") };
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
      return { hint: t("symptom_image_hint_skin_name"), confidence: "medium" };
    }
    if (rednessScore > 18) {
      return { hint: t("symptom_image_hint_red_tone"), confidence: "low" };
    }
    if (brightness < 70) {
      return { hint: t("symptom_image_hint_dark"), confidence: "low" };
    }
    return { hint: t("symptom_image_hint_none"), confidence: "low" };
  }

  async function runChecker() {
    if (!symptomText.trim() && !imageDataUrl) {
      alert(t("symptom_enter_text_or_image"));
      return;
    }
    setIsAnalyzing(true);
    try {
      const offline = buildOfflineDiagnosis(symptomText);
      const clinicalAI = buildClinicalAIResult({
        symptomText,
        age: patientAge
      });
      const initialDisease = formatConditionLabel(clinicalAI.label, t);
      const localizedRemedy = t(`symptom_rule_${clinicalAI.label}_remedy`, {
        defaultValue: clinicalAI.naturalRemedy || offline.naturalRemedy
      });
      const localizedAdvice = t(`symptom_rule_${clinicalAI.label}_advice`, {
        defaultValue: clinicalAI.doctorAdvice || offline.doctorAdvice
      });
      const localizedTreeReason = t(`symptom_risk_reason_${clinicalAI.riskLevel}`, {
        defaultValue: clinicalAI.treeReason || ""
      });
      const localizedTreeRisk = t(`symptom_risk_value_${clinicalAI.riskLevel}`, {
        defaultValue: clinicalAI.riskLevel
      });

      let output = {
        issue: initialDisease,
        disease: initialDisease,
        naturalRemedy: localizedRemedy,
        doctorAdvice: localizedAdvice,
        advice: `${localizedRemedy} ${localizedAdvice}`.trim(),
        confidence: clinicalAI.confidence || offline.confidence,
        serious: Boolean(clinicalAI.emergency) || offline.serious,
        redFlags:
          clinicalAI.emergency
            ? [t("symptom_potential_emergency_pattern")]
            : offline.redFlags || [],
        naiveBayesLabel: clinicalAI.label,
        naiveBayesProbabilities: clinicalAI.probabilities || {},
        decisionTreeRisk: localizedTreeRisk,
        decisionTreeReason: localizedTreeReason,
        imageHint: imageHint || "",
        imageConfidence,
        createdAt: Date.now()
      };

      try {
        const ai = await analyzeSymptomsWithAI({
          symptomText,
          imageDataUrl,
          language: i18n.language
        });
        const finalNaturalRemedy = ai.naturalRemedy || output.naturalRemedy;
        const finalDoctorAdvice = ai.doctorAdvice || output.doctorAdvice;
        output = {
          ...output,
          issue: output.issue,
          disease: output.disease,
          naturalRemedy: finalNaturalRemedy,
          doctorAdvice: finalDoctorAdvice,
          advice: ai.advice || `${finalNaturalRemedy} ${finalDoctorAdvice}`.trim(),
          confidence: ai.confidence || output.confidence,
          serious: Boolean(ai.serious) || output.serious,
          redFlags: ai.redFlags || output.redFlags || [],
          imageHint: imageHint || "",
          imageConfidence,
          createdAt: Date.now()
        };
        setEngine("ai+local-models");
      } catch {
        setEngine("on-device-ai");
      }

      const nextHistory = [output, ...history].slice(0, 20);
      setResult(output);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      const voiceSummary = `${t("symptom_voice_issue_prefix")} ${output.issue || output.disease || t("symptom_not_clear")}. ${t("symptom_voice_remedy_prefix")} ${output.naturalRemedy || t("symptom_none")}. ${t("symptom_voice_advice_prefix")} ${output.doctorAdvice || t("symptom_consult_if_needed")}.`;
      speakText(voiceSummary);
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
      alert(t("symptom_unable_process_image"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div style={checkerBox}>
      <p style={{ ...statusPill, background: statusColor }}>{onlineStatus} {t("status_mode")}</p>
      <textarea
        placeholder={t("symptom_text_placeholder")}
        value={symptomText}
        onChange={(e) => setSymptomText(e.target.value)}
        style={textArea}
      />
      <input
        type="number"
        min="0"
        max="120"
        placeholder={t("symptom_age_placeholder")}
        value={patientAge}
        onChange={(e) => setPatientAge(e.target.value)}
        style={ageInput}
      />
      <div style={voiceRow}>
        <button
          type="button"
          style={{ ...voiceBtn, background: isListening ? "#dc2626" : "#0f766e" }}
          onClick={startSymptomVoiceInput}
        >
          {isListening ? t("voice_listening") : t("symptom_speak_button")}
        </button>
        <button
          type="button"
          style={voiceBtn}
          onClick={() => {
            if (!result) return;
            speakText(
              `${t("symptom_voice_issue_prefix")} ${result.issue || result.disease || t("symptom_not_clear")}. ${t("symptom_voice_remedy_prefix")} ${result.naturalRemedy || t("symptom_none")}. ${t("symptom_voice_advice_prefix")} ${result.doctorAdvice || t("symptom_consult_if_needed")}.`
            );
          }}
          disabled={!result}
        >
          {t("symptom_read_result")}
        </button>
      </div>
      <div style={uploadRow}>
        <input type="file" accept="image/*" onChange={onImageChange} />
        {imageName ? <span style={smallText}>{t("symptom_image_label")}: {imageName}</span> : null}
      </div>
      {imageDataUrl ? <img src={imageDataUrl} alt="symptom upload" style={preview} /> : null}
      <button style={checkBtn} onClick={runChecker} disabled={isAnalyzing}>
        {isAnalyzing ? t("symptom_analyzing") : t("symptom_check_offline")}
      </button>

      {result ? (
        <div style={resultCard}>
          <SpeakableText as="h4" text={t("symptom_result")} style={{ margin: "0 0 8px" }} wrapperStyle={{ display: "flex" }} />
          <p style={resultText}><strong>{t("symptom_risk_level")}:</strong> {result.decisionTreeRisk || t("symptom_risk_value_low")}</p>
          <p style={resultText}><strong>{t("symptom_safety_note")}:</strong> {result.decisionTreeReason || "-"}</p>
          <p style={resultText}><strong>{t("symptom_probable_disease")}:</strong> {result.disease || result.issue || "-"}</p>
          <p style={resultText}><strong>{t("symptom_natural_remedy")}:</strong> {result.naturalRemedy || "-"}</p>
          <p style={resultText}><strong>{t("symptom_doctor_guidance")}:</strong> {result.doctorAdvice || "-"}</p>
          <p style={resultText}><strong>{t("symptom_confidence")}:</strong> {t(`symptom_confidence_${result.confidence || "low"}`)}</p>
          {result.serious ? <p style={seriousText}>{t("symptom_serious_detected")}</p> : null}
          {Array.isArray(result.redFlags) && result.redFlags.length > 0 ? (
            <p style={resultText}><strong>{t("symptom_red_flags")}:</strong> {result.redFlags.join(", ")}</p>
          ) : null}
          {result.imageHint ? (
            <p style={resultText}>
              <strong>{t("symptom_image_hint")}:</strong> {result.imageHint} ({result.imageConfidence || "low"} {t("symptom_confidence")})
            </p>
          ) : null}
          <SpeakableText
            as="p"
            text={t("symptom_emergency_warning")}
            style={warningText}
            wrapperStyle={{ display: "flex" }}
          />
        </div>
      ) : null}

      {symptomSummary.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <SpeakableText
            as="h4"
            text={t("symptom_recent_checks")}
            style={{ margin: "0 0 8px", color: "#203a43" }}
            wrapperStyle={{ display: "flex" }}
          />
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

const ageInput = {
  width: "100%",
  marginTop: 10,
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

const voiceRow = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

const voiceBtn = {
  minHeight: 52,
  minWidth: 160,
  border: "none",
  borderRadius: 12,
  background: "#0f766e",
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
  padding: "10px 14px",
  cursor: "pointer"
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
