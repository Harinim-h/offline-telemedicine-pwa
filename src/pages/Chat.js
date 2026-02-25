import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { addChatMessageCloud, getChatMessagesCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function Chat() {
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
  const [text, setText] = useState("");
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
      if (!shouldUseCloud) {
        setMessages([]);
        return;
      }
      const data = await getChatMessagesCloud(appointmentId);
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

  async function sendMessage(e) {
    e.preventDefault();
    if (!appointmentId || !text.trim()) return;

    try {
      if (!shouldUseCloud) {
        alert("Supabase cloud is required and internet must be available.");
        return;
      }
      const payload = {
        text: text.trim(),
        senderRole: role,
        senderName: user?.name || (role === "doctor" ? "Doctor" : "Patient")
      };
      await addChatMessageCloud(appointmentId, payload);

      const refreshed = await getChatMessagesCloud(appointmentId);
      setMessages(refreshed);
      setText("");
    } catch {
      alert("Unable to send message.");
    }
  }

  if (!appointmentId) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>Text Consultation</h2>
        <p>Invalid consultation. Open chat from appointment queue.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Text Consultation</h2>
      {!shouldUseCloud && <p style={styles.empty}>Cloud connection required for chat.</p>}
      <div style={styles.chatBox}>
        {messages.length === 0 && <p style={styles.empty}>No messages yet.</p>}
        {messages.map((m) => {
          const mine = m.senderRole === role;
          return (
            <div key={m.id} style={{ ...styles.msg, ...(mine ? styles.mine : styles.theirs) }}>
              <div style={styles.meta}>
                {m.senderName} ({m.senderRole})
              </div>
              <div>{m.text}</div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          style={styles.input}
        />
        <button style={styles.button} type="submit">
          Send
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
  }
};
