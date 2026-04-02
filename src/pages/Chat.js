import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  addChatMessageCloud,
  getAppointmentByIdCloud,
  getChatMessagesCloud,
  getPharmaciesCloud
} from "../services/cloudData";
import {
  addChatMessage,
  getAppointmentById,
  getChatMessages
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";
import SpeakableText from "../components/SpeakableText";
import { getSpeechLang } from "../utils/speech";
import { translateChatTextWithMeta } from "../services/translationService";

const PRESCRIPTION_PREFIX = "[PRESCRIPTION]";
const IMAGE_PREFIX = "[IMAGE]";

function parseImageMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(IMAGE_PREFIX)) return "";
  return text.slice(IMAGE_PREFIX.length).trim();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxSide = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height && width > maxSide) {
        height = Math.round((height * maxSide) / width);
        width = maxSide;
      } else if (height >= width && height > maxSide) {
        width = Math.round((width * maxSide) / height);
        height = maxSide;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas-context-failed"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = dataUrl;
  });
}

function parsePrescriptionMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(PRESCRIPTION_PREFIX)) return null;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pickup = (label) => {
    const row = lines.find((line) => line.startsWith(`${label}:`));
    return row ? row.slice(label.length + 1).trim() : "";
  };

  const medsStart = lines.findIndex((line) => line === "Medicines:");
  const notesStart = lines.findIndex((line) => line.startsWith("Notes:"));
  const medicines =
    medsStart >= 0
      ? lines
          .slice(medsStart + 1, notesStart >= 0 ? notesStart : undefined)
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2).trim())
      : [];

  return {
    patientName: pickup("Patient Name"),
    patientMobile: pickup("Patient Mobile"),
    doctorName: pickup("Doctor Name"),
    issuedAt: pickup("Issued At"),
    appointmentId: pickup("Appointment Id"),
    pharmacyOwnerEmail: pickup("Pharmacy Owner Email"),
    medicines,
    notes: pickup("Notes")
  };
}

function buildPrescriptionMessage({
  appointmentId,
  patientName,
  patientMobile,
  doctorName,
  pharmacyOwnerEmail,
  medicines,
  notes
}) {
  const medsLines = (medicines || [])
    .map((m) => String(m || "").trim())
    .filter(Boolean)
    .map((m) => `- ${m}`)
    .join("\n");

  return [
    PRESCRIPTION_PREFIX,
    `Patient Name: ${String(patientName || "").trim() || "-"}`,
    `Patient Mobile: ${String(patientMobile || "").trim() || "-"}`,
    `Doctor Name: ${String(doctorName || "").trim() || "-"}`,
    `Issued At: ${new Date().toLocaleString()}`,
    `Appointment Id: ${String(appointmentId || "").trim() || "-"}`,
    `Pharmacy Owner Email: ${String(pharmacyOwnerEmail || "").trim() || "ALL"}`,
    "Medicines:",
    medsLines || "- No medicines listed",
    `Notes: ${String(notes || "").trim() || "Take medicines as prescribed by doctor."}`,
    "Share With: Patient and Pharmacy"
  ].join("\n");
}

export default function Chat() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") || "";
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [messages, setMessages] = useState([]);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [translationStatus, setTranslationStatus] = useState("");
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appointmentMeta, setAppointmentMeta] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionPharmacies, setPrescriptionPharmacies] = useState([]);
  const [selectedPharmacyOwnerEmail, setSelectedPharmacyOwnerEmail] = useState("ALL");
  const [isSendingPrescription, setIsSendingPrescription] = useState(false);
  const imageInputRef = useRef(null);
  const shouldUseCloud = hasSupabase && isOnline;
  const targetLanguage = String(
    sessionStorage.getItem("userLanguage") ||
      localStorage.getItem("language") ||
      i18n.language ||
      "en"
  )
    .split("-")[0]
    .toLowerCase();

  useEffect(() => {
    // Keep UI and translation target aligned with login-selected language.
    if (i18n.language !== targetLanguage) {
      i18n.changeLanguage(targetLanguage);
    }
  }, [i18n, targetLanguage]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!appointmentId) return undefined;
    let active = true;

    async function loadMessages() {
      const data = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      if (!active) return;
      setMessages(data);
    }

    loadMessages();
    const timer = setInterval(loadMessages, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [appointmentId, shouldUseCloud]);

  useEffect(() => {
    if (role !== "doctor") return undefined;
    let active = true;

    async function loadPharmaciesForPrescription() {
      if (!shouldUseCloud) {
        if (active) setPrescriptionPharmacies([]);
        return;
      }
      try {
        const list = await getPharmaciesCloud();
        if (!active) return;
        setPrescriptionPharmacies(list || []);
      } catch {
        if (active) setPrescriptionPharmacies([]);
      }
    }

    loadPharmaciesForPrescription();
    return () => {
      active = false;
    };
  }, [role, shouldUseCloud]);

  useEffect(() => {
    if (!appointmentId) return undefined;
    let active = true;

    async function loadAppointmentMeta() {
      try {
        const info = shouldUseCloud
          ? await getAppointmentByIdCloud(appointmentId)
          : await getAppointmentById(appointmentId);
        if (!active) return;
        setAppointmentMeta(info || null);
      } catch {
        if (active) setAppointmentMeta(null);
      }
    }

    loadAppointmentMeta();
    return () => {
      active = false;
    };
  }, [appointmentId, shouldUseCloud]);

  useEffect(() => {
    let active = true;

    async function translateIncomingMessages() {
      const nextTranslations = {};
      let lastProvider = "";

      for (const message of messages) {
        const originalText = String(message?.text || "").trim();
        if (!originalText) {
          nextTranslations[message.id] = "";
          continue;
        }

        if (parsePrescriptionMessage(originalText)) {
          nextTranslations[message.id] = originalText;
          continue;
        }
        if (parseImageMessage(originalText)) {
          nextTranslations[message.id] = originalText;
          continue;
        }

        const translated = await translateChatTextWithMeta(
          originalText,
          targetLanguage
        );
        nextTranslations[message.id] = translated.text;
        if (translated.provider) lastProvider = translated.provider;
      }

      if (!active) return;
      setTranslatedMessages(nextTranslations);
      setTranslationStatus(lastProvider ? `Translation: ${lastProvider}` : "");
    }

    translateIncomingMessages();

    return () => {
      active = false;
    };
  }, [i18n.language, messages, role, targetLanguage]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!appointmentId || !text.trim()) return;

    try {
      const payload = {
        text: text.trim(),
        senderRole: role,
        senderName: user?.name || (role === "doctor" ? t("doctor") : t("patient"))
      };
      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
      setText("");
    } catch {
      alert(t("chat_unable_send"));
    }
  }

  async function sendImageFile(file) {
    if (!file || !appointmentId) return;
    if (!String(file.type || "").startsWith("image/")) {
      alert(t("chat_image_only", "Please choose an image file."));
      return;
    }

    setIsImageUploading(true);
    try {
      const originalDataUrl = await readFileAsDataUrl(file);
      let compressedDataUrl = await compressImageDataUrl(originalDataUrl);
      if (compressedDataUrl.length > 800000) {
        compressedDataUrl = await compressImageDataUrl(originalDataUrl, 700, 0.58);
      }

      const payload = {
        text: `${IMAGE_PREFIX}${compressedDataUrl}`,
        senderRole: role,
        senderName: user?.name || (role === "doctor" ? t("doctor") : t("patient"))
      };

      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
    } catch {
      alert(t("chat_image_upload_failed", "Unable to upload image right now."));
    } finally {
      setIsImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function onSelectImage(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    sendImageFile(file);
  }

  async function sendPrescription() {
    if (role !== "doctor" || !appointmentId) return;

    const lines = prescriptionMedicines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      alert(t("chat_prescription_medicine_required", "Please enter at least one medicine line."));
      return;
    }

    const payload = {
      text: buildPrescriptionMessage({
        appointmentId,
        patientName: appointmentMeta?.patientName || "Patient",
        patientMobile: appointmentMeta?.patientMobile || "-",
        doctorName: user?.name || t("doctor"),
        pharmacyOwnerEmail: selectedPharmacyOwnerEmail,
        medicines: lines,
        notes: prescriptionNotes
      }),
      senderRole: role,
      senderName: user?.name || t("doctor")
    };

    setIsSendingPrescription(true);
    try {
      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
      setPrescriptionMedicines("");
      setPrescriptionNotes("");
      setSelectedPharmacyOwnerEmail("ALL");
      setShowPrescriptionForm(false);
    } catch {
      alert(t("chat_prescription_send_failed", "Unable to send prescription right now."));
    } finally {
      setIsSendingPrescription(false);
    }
  }

  function startVoiceTyping() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(i18n.language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setText((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  if (!appointmentId) {
    return (
      <div style={styles.page}>
        <SpeakableText
          as="h2"
          text={t("chat_title")}
          style={styles.title}
          wrapperStyle={{ display: "flex" }}
        />
        <SpeakableText
          as="p"
          text={t("chat_invalid_consultation")}
          wrapperStyle={{ display: "flex" }}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("chat_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex" }}
      />
      {!shouldUseCloud && hasSupabase && (
        <SpeakableText
          as="p"
          text={t("chat_offline_message")}
          style={styles.empty}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {translationStatus && (
        <p style={styles.translationStatus}>{translationStatus}</p>
      )}
      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <SpeakableText
            as="p"
            text={t("chat_no_messages")}
            style={styles.empty}
            wrapperStyle={{ display: "flex" }}
          />
        )}
        {messages.map((m) => {
          const mine = m.senderRole === role;
          const rawText = translatedMessages[m.id] || m.text;
          const imageSrc = parseImageMessage(rawText);
          const prescription = parsePrescriptionMessage(rawText);
          return (
            <div key={m.id} style={{ ...styles.msg, ...(mine ? styles.mine : styles.theirs) }}>
              <div style={styles.meta}>
                {m.senderName} ({m.senderRole})
              </div>
              {imageSrc ? (
                <div style={styles.imageMessageWrap}>
                  <img src={imageSrc} alt={t("chat_image_alt", "Shared symptom")} style={styles.imageMsg} />
                </div>
              ) : prescription ? (
                <div style={styles.prescriptionMsg}>
                  <div style={styles.rxTitle}>{t("chat_prescription_title", "Doctor Prescription")}</div>
                  <div style={styles.rxMeta}>
                    {t("chat_prescription_patient_label", "Patient")}: {prescription.patientName || "-"}
                    {" | "}
                    {t("mobile", "Mobile")}: {prescription.patientMobile || "-"}
                  </div>
                  <div style={styles.rxMeta}>
                    {t("doctor", "Doctor")}: {prescription.doctorName || "-"}
                  </div>
                  <div style={styles.rxMeta}>
                    {t("chat_prescription_pharmacy_owner", "Pharmacy Owner")}: {prescription.pharmacyOwnerEmail || "ALL"}
                  </div>
                  <div style={styles.rxListTitle}>{t("chat_prescription_medicines", "Medicines")}</div>
                  {prescription.medicines.length === 0 ? (
                    <div style={styles.rxLine}>-</div>
                  ) : (
                    prescription.medicines.map((line, idx) => (
                      <div key={`${m.id}_rx_${idx}`} style={styles.rxLine}>
                        {idx + 1}. {line}
                      </div>
                    ))
                  )}
                  {prescription.notes && (
                    <div style={styles.rxNotes}>
                      {t("chat_prescription_notes", "Notes")}: {prescription.notes}
                    </div>
                  )}
                </div>
              ) : (
                <SpeakableText text={rawText} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat_type_message")}
          style={styles.input}
        />
        {role === "patient" && (
          <button
            type="button"
            style={styles.voiceBtn}
            onClick={startVoiceTyping}
          >
            {isListening ? t("voice_listening") : t("chat_speak_message")}
          </button>
        )}
        <button style={styles.button} type="submit">
          {t("chat_send")}
        </button>
        <button
          type="button"
          style={styles.imageBtn}
          onClick={() => imageInputRef.current?.click()}
          disabled={isImageUploading}
        >
          {isImageUploading
            ? t("please_wait")
            : t("chat_upload_image", "Upload Photo")}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={onSelectImage}
        />
      </form>

      {role === "doctor" && (
        <div style={styles.prescriptionCard}>
          <div style={styles.prescriptionHeader}>
            <strong>{t("chat_prescription_title", "Doctor Prescription")}</strong>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => setShowPrescriptionForm((prev) => !prev)}
            >
              {showPrescriptionForm
                ? t("chat_prescription_hide_form", "Hide Form")
                : t("chat_prescription_open_form", "Create Prescription")}
            </button>
          </div>
          {showPrescriptionForm && (
            <div style={styles.prescriptionForm}>
              <p style={styles.prescriptionMeta}>
                {t("chat_prescription_patient_label", "Patient")}: {appointmentMeta?.patientName || "-"} | {" "}
                {t("mobile", "Mobile")}: {appointmentMeta?.patientMobile || "-"}
              </p>
              <textarea
                value={prescriptionMedicines}
                onChange={(e) => setPrescriptionMedicines(e.target.value)}
                placeholder={t(
                  "chat_prescription_medicines_placeholder",
                  "One medicine per line, e.g. Paracetamol 650mg - 1-0-1 after food for 3 days"
                )}
                style={styles.textArea}
              />
              <label style={styles.prescriptionLabel}>
                {t("chat_prescription_select_pharmacy", "Send to Pharmacy Owner")}
              </label>
              <select
                value={selectedPharmacyOwnerEmail}
                onChange={(e) => setSelectedPharmacyOwnerEmail(e.target.value)}
                style={styles.input}
              >
                <option value="ALL">
                  {t("chat_prescription_all_pharmacies", "All Pharmacy Owners")}
                </option>
                {prescriptionPharmacies.map((p) => (
                  <option key={p.id} value={String(p.ownerEmail || "").toLowerCase()}>
                    {p.name} ({String(p.ownerEmail || "").toLowerCase()})
                  </option>
                ))}
              </select>
              <textarea
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder={t(
                  "chat_prescription_notes_placeholder",
                  "Optional notes for patient and pharmacy"
                )}
                style={{ ...styles.textArea, minHeight: 74 }}
              />
              <button
                type="button"
                style={styles.button}
                onClick={sendPrescription}
                disabled={isSendingPrescription}
              >
                {isSendingPrescription
                  ? t("please_wait")
                  : t("chat_prescription_send", "Send Prescription")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e0f7fa",
    padding: 24
  },
  title: {
    marginTop: 0,
    color: "#0f2027"
  },
  chatBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    minHeight: 320,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  empty: {
    color: "#5b7480"
  },
  translationStatus: {
    margin: "0 0 10px",
    color: "#3d5a66",
    fontSize: 12
  },
  msg: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: "8px 10px",
    marginBottom: 8
  },
  mine: {
    marginLeft: "auto",
    background: "#2c5364",
    color: "#fff"
  },
  theirs: {
    marginRight: "auto",
    background: "#edf4f7",
    color: "#0d2430"
  },
  meta: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 2
  },
  form: {
    marginTop: 12,
    display: "flex",
    gap: 8
  },
  input: {
    flex: 1,
    border: "1px solid #b8cfd8",
    borderRadius: 8,
    padding: "10px 12px"
  },
  button: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#203a43",
    color: "#fff",
    cursor: "pointer"
  },
  voiceBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#0f766e",
    color: "#fff",
    cursor: "pointer"
  },
  imageBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#1f4f5f",
    color: "#fff",
    cursor: "pointer"
  },
  secondaryBtn: {
    border: "1px solid #a6c0cb",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#f4fbfe",
    color: "#1f4b5d",
    cursor: "pointer"
  },
  prescriptionCard: {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #d0e4ec",
    borderRadius: 12,
    padding: 12
  },
  prescriptionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  prescriptionForm: {
    marginTop: 10,
    display: "grid",
    gap: 8
  },
  prescriptionMeta: {
    margin: 0,
    color: "#355664",
    fontSize: 13
  },
  prescriptionLabel: {
    margin: "2px 0 0",
    color: "#355664",
    fontSize: 13,
    fontWeight: 600
  },
  textArea: {
    width: "100%",
    border: "1px solid #b8cfd8",
    borderRadius: 8,
    padding: "10px 12px",
    minHeight: 110,
    resize: "vertical"
  },
  prescriptionMsg: {
    display: "grid",
    gap: 4
  },
  rxTitle: {
    fontWeight: 700
  },
  rxMeta: {
    fontSize: 12,
    opacity: 0.92
  },
  rxListTitle: {
    marginTop: 4,
    fontWeight: 600
  },
  rxLine: {
    fontSize: 14
  },
  rxNotes: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic"
  },
  imageMessageWrap: {
    marginTop: 6
  },
  imageMsg: {
    maxWidth: "100%",
    borderRadius: 10,
    display: "block",
    border: "1px solid rgba(255,255,255,0.25)"
  }
};
