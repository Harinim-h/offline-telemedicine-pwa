const TRAINING_SAMPLES = [
  // Viral Fever - 6 samples
  {
    label: "viral_fever",
    text: "fever chills body pain fatigue headache weakness"
  },
  {
    label: "viral_fever",
    text: "high temperature shivering tiredness muscle pain fever"
  },
  {
    label: "viral_fever",
    text: "fever 101 temperature body ache with chills malaise"
  },
  {
    label: "viral_fever",
    text: "sudden onset fever myalgia joint pain fatigue"
  },
  {
    label: "viral_fever",
    text: "fever sweating chills weakness general body pain"
  },
  {
    label: "viral_fever",
    text: "high fever temperature exhaustion body ache weakness"
  },
  
  // Cold & Cough - 6 samples
  {
    label: "cold_cough",
    text: "cold cough sore throat runny nose sneezing blocked nose"
  },
  {
    label: "cold_cough",
    text: "cough throat irritation mild fever sneezing nasal congestion"
  },
  {
    label: "cold_cough",
    text: "persistent cough sore throat stuffy nose runny discharge"
  },
  {
    label: "cold_cough",
    text: "throat pain coughing sneezing nasal blockage respiratory"
  },
  {
    label: "cold_cough",
    text: "continuous cough scratchy throat nose congestion sniffles"
  },
  {
    label: "cold_cough",
    text: "bronchial cough mucus throat irritation nasal symptoms"
  },
  
  // Migraine & Headache - 6 samples
  {
    label: "migraine_headache",
    text: "severe headache migraine nausea light sensitivity one side pain"
  },
  {
    label: "migraine_headache",
    text: "headache throbbing pain vomiting visual disturbance migraine"
  },
  {
    label: "migraine_headache",
    text: "intense headache photophobia pulsating unilateral pain"
  },
  {
    label: "migraine_headache",
    text: "head pain throbbing dizziness nausea aura symptoms"
  },
  {
    label: "migraine_headache",
    text: "severe head pain light bothers blurred vision vomiting"
  },
  {
    label: "migraine_headache",
    text: "pounding headache one side temples neck stiffness nausea"
  },
  
  // Gastro Issue - 6 samples
  {
    label: "gastro_issue",
    text: "stomach pain diarrhea vomiting food poisoning abdominal cramps nausea"
  },
  {
    label: "gastro_issue",
    text: "loose motion abdominal pain vomiting dehydration stomach upset"
  },
  {
    label: "gastro_issue",
    text: "severe abdominal pain diarrhea nausea stomach discomfort"
  },
  {
    label: "gastro_issue",
    text: "stomach cramping loose stool digestive upset nausea vomiting"
  },
  {
    label: "gastro_issue",
    text: "abdominal discomfort bowel movement diarrhea stomach pain food"
  },
  {
    label: "gastro_issue",
    text: "belly pain cramping loose motion indigestion stomach trouble"
  },
  
  // Skin Allergy - 6 samples
  {
    label: "skin_allergy",
    text: "rash itching skin redness hives irritation allergy patch"
  },
  {
    label: "skin_allergy",
    text: "itchy skin red patch swelling allergic reaction rashes"
  },
  {
    label: "skin_allergy",
    text: "skin eruption itching redness urticaria hives reaction"
  },
  {
    label: "skin_allergy",
    text: "dermitis itchy bumps skin irritation allergic rash"
  },
  {
    label: "skin_allergy",
    text: "red rash itching swollen skin allergy dermatitis"
  },
  {
    label: "skin_allergy",
    text: "skin inflammation itchy patches hives contact reaction"
  },
  
  // Cardio-Respiratory - 6 samples
  {
    label: "cardio_respiratory",
    text: "chest pain shortness of breath breathless tight chest dizziness"
  },
  {
    label: "cardio_respiratory",
    text: "left arm pain chest pressure breathing difficulty sweating fainting"
  },
  {
    label: "cardio_respiratory",
    text: "chest tightness breathlessness palpitations cardiac pain anxiety"
  },
  {
    label: "cardio_respiratory",
    text: "difficult breathing chest discomfort heart pain respiratory distress"
  },
  {
    label: "cardio_respiratory",
    text: "chest compression breathlessness diaphoresis cardiac symptoms urgent"
  },
  {
    label: "cardio_respiratory",
    text: "chest heaviness shortness breath cardiovascular emergency dyspnea"
  }
];

const REMEDY_BY_LABEL = {
  viral_fever: "Hydrate well, take rest, and monitor temperature.",
  cold_cough: "Warm fluids, steam inhalation, and adequate rest can help.",
  migraine_headache: "Rest in a quiet dark room and stay hydrated.",
  gastro_issue: "Use oral rehydration, light diet, and avoid oily food.",
  skin_allergy: "Avoid triggers, keep skin clean, and use soothing care.",
  cardio_respiratory:
    "Avoid exertion and seek urgent medical attention for chest or breathing symptoms."
};

const ADVICE_BY_LABEL = {
  viral_fever:
    "Consult a doctor if fever stays above 2 days or new symptoms appear.",
  cold_cough:
    "Consult a doctor if breathing trouble, high fever, or persistent cough occurs.",
  migraine_headache:
    "Consult a doctor if headache is severe, frequent, or has neurologic symptoms.",
  gastro_issue:
    "Consult a doctor if vomiting persists, dehydration worsens, or blood appears.",
  skin_allergy:
    "Consult a doctor if rash spreads quickly, blisters, or swelling appears.",
  cardio_respiratory:
    "Immediate doctor or emergency care is advised for chest pain or breathing difficulty."
};

const CLASS_KEYWORDS = {
  viral_fever: [
    "fever",
    "temperature",
    "chills",
    "body pain",
    "fatigue",
    "shivering",
    "weakness",
    "myalgia",
    "muscle pain",
    "sweating",
    "malaise",
    "high temperature",
    "onset fever",
    "joint pain"
  ],
  cold_cough: [
    "cold",
    "cough",
    "sore throat",
    "runny nose",
    "sneezing",
    "blocked nose",
    "nasal congestion",
    "throat pain",
    "stuffy nose",
    "nasal",
    "bronchial",
    "mucus",
    "respiratory",
    "throat irritation",
    "coughing"
  ],
  migraine_headache: [
    "headache",
    "migraine",
    "light sensitivity",
    "one side pain",
    "throbbing",
    "visual disturbance",
    "photophobia",
    "pulsating",
    "aura",
    "temples",
    "neck stiffness",
    "head pain",
    "blurred vision",
    "pounding",
    "dizziness"
  ],
  gastro_issue: [
    "stomach pain",
    "diarrhea",
    "vomiting",
    "food poisoning",
    "abdominal",
    "loose motion",
    "nausea",
    "cramping",
    "bowel",
    "digestive",
    "belly pain",
    "indigestion",
    "abdominal pain",
    "bowel movement",
    "stomach discomfort"
  ],
  skin_allergy: [
    "rash",
    "itching",
    "skin",
    "hives",
    "allergy",
    "red patch",
    "skin redness",
    "itchy",
    "eruption",
    "urticaria",
    "dermatitis",
    "dermitis",
    "swelling",
    "bumps",
    "irritation",
    "contact reaction"
  ],
  cardio_respiratory: [
    "chest pain",
    "shortness of breath",
    "breathing difficulty",
    "breathless",
    "left arm pain",
    "tight chest",
    "dizziness",
    "cardiac",
    "palpitations",
    "breathlessness",
    "sweating",
    "chest pressure",
    "heart pain",
    "chest tightness",
    "dyspnea",
    "diaphoresis",
    "respiratory distress"
  ]
};

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function trainModel(samples) {
  const classDocCount = {};
  const classWordCount = {};
  const classTokenTotals = {};
  const vocabulary = new Set();

  for (const sample of samples) {
    const label = sample.label;
    const tokens = tokenize(sample.text);

    classDocCount[label] = (classDocCount[label] || 0) + 1;
    if (!classWordCount[label]) classWordCount[label] = {};
    if (!classTokenTotals[label]) classTokenTotals[label] = 0;

    for (const token of tokens) {
      vocabulary.add(token);
      classWordCount[label][token] = (classWordCount[label][token] || 0) + 1;
      classTokenTotals[label] += 1;
    }
  }

  return {
    classDocCount,
    classWordCount,
    classTokenTotals,
    vocabularySize: vocabulary.size,
    totalDocs: samples.length
  };
}

const MODEL = trainModel(TRAINING_SAMPLES);
const MODEL_VOCAB = new Set(
  Object.values(MODEL.classWordCount).flatMap((obj) => Object.keys(obj))
);

function toProbabilityMap(logScores) {
  const entries = Object.entries(logScores);
  const maxLog = Math.max(...entries.map(([, value]) => value));
  const exps = entries.map(([label, value]) => [label, Math.exp(value - maxLog)]);
  const sum = exps.reduce((acc, [, value]) => acc + value, 0);

  const probs = {};
  for (const [label, value] of exps) {
    probs[label] = sum > 0 ? value / sum : 0;
  }
  return probs;
}

export function predictWithNaiveBayes(symptomText) {
  const rawTokens = tokenize(symptomText);
  const labels = Object.keys(MODEL.classDocCount);
  if (rawTokens.length === 0) {
    return {
      label: "viral_fever",
      confidence: "low",
      probabilities: {}
    };
  }

  const tokens = rawTokens.filter((token) => MODEL_VOCAB.has(token));
  const text = String(symptomText || "").toLowerCase();
  const keywordScores = {};
  for (const label of labels) {
    const keywords = CLASS_KEYWORDS[label] || [];
    keywordScores[label] = keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? (keyword.includes(" ") ? 2 : 1) : 0);
    }, 0);
  }
  const maxKeywordScore = Math.max(...Object.values(keywordScores), 0);

  // If clear symptom-group keywords are present, prefer that class directly.
  if (maxKeywordScore >= 2) {
    const best = Object.entries(keywordScores).sort((a, b) => b[1] - a[1])[0];
    const label = best?.[0] || "viral_fever";
    return {
      label,
      confidence: maxKeywordScore >= 4 ? "high" : "medium",
      probabilities: {}
    };
  }

  if (tokens.length === 0) {
    if (maxKeywordScore > 0) {
      const best = Object.entries(keywordScores).sort((a, b) => b[1] - a[1])[0];
      const label = best?.[0] || "viral_fever";
      return {
        label,
        confidence: best?.[1] >= 3 ? "medium" : "low",
        probabilities: {}
      };
    }

    return {
      label: "viral_fever",
      confidence: "low",
      probabilities: {}
    };
  }

  const logScores = {};
  for (const label of labels) {
    const prior =
      Math.log((MODEL.classDocCount[label] || 0) + 1) -
      Math.log(MODEL.totalDocs + labels.length);
    let score = prior;

    for (const token of tokens) {
      const count = MODEL.classWordCount[label]?.[token] || 0;
      const prob =
        (count + 1) /
        ((MODEL.classTokenTotals[label] || 0) + MODEL.vocabularySize);
      score += Math.log(prob);
    }
    logScores[label] = score;
  }

  const nbProbabilities = toProbabilityMap(logScores);
  const combinedScores = {};
  for (const label of labels) {
    const nb = nbProbabilities[label] || 0;
    const keywordBoost =
      maxKeywordScore > 0 ? (keywordScores[label] || 0) / maxKeywordScore : 0;
    combinedScores[label] = nb * 0.45 + keywordBoost * 0.55;
  }
  const sorted = Object.entries(combinedScores).sort((a, b) => b[1] - a[1]);
  const [topLabel, topScore] = sorted[0] || ["viral_fever", 0];

  const confidence =
    topScore >= 0.68 ? "high" : topScore >= 0.42 ? "medium" : "low";

  return {
    label: topLabel,
    confidence,
    probabilities: nbProbabilities
  };
}

export function predictSeverityWithDecisionTree({ symptomText, age }) {
  const input = String(symptomText || "").toLowerCase();
  const numericAge = Number(age || 0);
  const has = (word) => input.includes(word);

  const severeBreathing =
    has("shortness of breath") || has("breathing difficulty") || has("breathless");
  const chestWarning =
    has("chest pain") || has("tight chest") || has("left arm pain");
  const neuroWarning = has("fainted") || has("unconscious") || has("confusion");
  const bleedingWarning = has("blood vomiting") || has("blood in stool");
  const veryHighFever =
    has("103") || has("104") || has("high fever") || has("seizure");
  const moderateWarning =
    has("vomiting") || has("diarrhea") || has("dehydration") || has("rash");

  if (severeBreathing || chestWarning || neuroWarning || bleedingWarning) {
    return {
      riskLevel: "high",
      emergency: true,
      reason:
        "Emergency symptoms pattern detected (cardiorespiratory or neurologic red flag)."
    };
  }

  if (veryHighFever && numericAge >= 60) {
    return {
      riskLevel: "high",
      emergency: true,
      reason: "High fever with higher-age risk profile."
    };
  }

  if (veryHighFever || moderateWarning) {
    return {
      riskLevel: "medium",
      emergency: false,
      reason: "Moderate-risk symptom pattern detected."
    };
  }

  return {
    riskLevel: "low",
    emergency: false,
    reason: "No high-risk branch triggered in decision tree."
  };
}

export function buildClinicalAIResult({ symptomText, age }) {
  const nb = predictWithNaiveBayes(symptomText);
  const tree = predictSeverityWithDecisionTree({ symptomText, age });

  return {
    label: nb.label,
    confidence: nb.confidence,
    probabilities: nb.probabilities,
    riskLevel: tree.riskLevel,
    emergency: tree.emergency,
    treeReason: tree.reason,
    naturalRemedy: REMEDY_BY_LABEL[nb.label] || REMEDY_BY_LABEL.viral_fever,
    doctorAdvice: ADVICE_BY_LABEL[nb.label] || ADVICE_BY_LABEL.viral_fever
  };
}
