import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addChatMessageCloud, getChatMessagesCloud } from "../services/cloudData";
import { addChatMessage, getChatMessages } from "../services/localData";
import { hasSupabase } from "../supabaseClient";
import SpeakableText from "../components/SpeakableText";
import { getSpeechLang } from "../utils/speech";
import { translateChatText } from "../services/translationService";

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
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const shouldUseCloud = hasSupabase && isOnline;

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
    let active = true;

    async function translateIncomingMessages() {
      const nextTranslations = {};
      const targetLanguage =
        role === "doctor"
          ? "en"
          : String(i18n.language || "en").split("-")[0].toLowerCase();

      for (const message of messages) {
        const originalText = String(message?.text || "").trim();
        if (!originalText) {
          nextTranslations[message.id] = "";
          continue;
        }

        if (message.senderRole === role) {
          nextTranslations[message.id] = originalText;
          continue;
        }

        nextTranslations[message.id] = await translateChatText(
          originalText,
          targetLanguage
        );
      }

      if (!active) return;
      setTranslatedMessages(nextTranslations);
    }

    translateIncomingMessages();

    return () => {
      active = false;
    };
  }, [i18n.language, messages, role]);

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
          const displayText = translatedMessages[m.id] || m.text;
          return (
            <div key={m.id} style={{ ...styles.msg, ...(mine ? styles.mine : styles.theirs) }}>
              <div style={styles.meta}>
                {m.senderName} ({m.senderRole})
              </div>
              <SpeakableText text={displayText} />
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
      </form>
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
  }
};
