import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const CALL_KEY = "telemedicine_call_room";
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

function roomStorageKey(roomCode) {
  return `consult_room_${roomCode}`;
}

function readRoom(roomCode) {
  try {
    const raw = localStorage.getItem(roomStorageKey(roomCode));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoom(roomCode, roomData) {
  localStorage.setItem(roomStorageKey(roomCode), JSON.stringify(roomData));
}

export default function Consultation() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const codeFromUrl = (searchParams.get("code") || "").trim().toUpperCase();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [roomCode, setRoomCode] = useState(
    codeFromUrl || localStorage.getItem(CALL_KEY) || ""
  );
  const [inCall, setInCall] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [status, setStatus] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pollerRef = useRef(null);
  const activeSessionIdRef = useRef("");
  const doctorCandidateIndexRef = useRef(0);
  const patientCandidateIndexRef = useRef(0);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!codeFromUrl) return;
    setRoomCode(codeFromUrl);
    localStorage.setItem(CALL_KEY, codeFromUrl);
  }, [codeFromUrl]);

  function generateRoomCode() {
    const code = `TM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setRoomCode(code);
    localStorage.setItem(CALL_KEY, code);
  }

  async function prepareMedia() {
    if (localStreamRef.current) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError(t("video_call_not_supported"));
      return false;
    }

    try {
      setIsPreparing(true);
      setPermissionError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return true;
    } catch {
      setPermissionError(t("video_call_permission_error"));
      return false;
    } finally {
      setIsPreparing(false);
    }
  }

  function setupPeerConnection(cleanCode) {
    const connection = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = connection;

    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

    localStreamRef.current.getTracks().forEach((track) => {
      connection.addTrack(track, localStreamRef.current);
    });

    connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setRemoteJoined(true);
      setStatus(t("video_call_connected"));
    };

    connection.onicecandidate = (event) => {
      if (!event.candidate) return;
      const room = readRoom(cleanCode);
      if (!room || room.sessionId !== activeSessionIdRef.current) return;

      const candidate = {
        ...event.candidate.toJSON(),
        sessionId: activeSessionIdRef.current
      };
      if (role === "doctor") {
        room.doctorCandidates = [...(room.doctorCandidates || []), candidate];
      } else {
        room.patientCandidates = [...(room.patientCandidates || []), candidate];
      }
      room.updatedAt = Date.now();
      saveRoom(cleanCode, room);
    };
  }

  async function consumeRemoteCandidates(cleanCode) {
    const room = readRoom(cleanCode);
    const connection = peerConnectionRef.current;
    if (!room || !connection || !connection.remoteDescription) return;

    const list =
      role === "doctor"
        ? room.patientCandidates || []
        : room.doctorCandidates || [];
    const idxRef =
      role === "doctor" ? patientCandidateIndexRef : doctorCandidateIndexRef;

    for (let i = idxRef.current; i < list.length; i += 1) {
      const candidate = list[i];
      if (candidate.sessionId !== activeSessionIdRef.current) continue;
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore bad candidate
      }
    }
    idxRef.current = list.length;
  }

  function startRoomPoller(cleanCode) {
    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(async () => {
      const room = readRoom(cleanCode);
      const connection = peerConnectionRef.current;
      if (!room || !connection) return;

      if (room.endedAt) {
        teardownCall(false);
        setStatus(t("video_call_ended"));
        return;
      }

      if (
        role === "doctor" &&
        room.answer &&
        room.answer.sessionId === activeSessionIdRef.current &&
        !connection.currentRemoteDescription
      ) {
        await connection.setRemoteDescription(
          new RTCSessionDescription(room.answer)
        );
      }

      await consumeRemoteCandidates(cleanCode);
    }, 700);
  }

  async function startCall() {
    if (!roomCode.trim()) {
      setStatus(t("video_call_enter_room"));
      return;
    }

    const ready = await prepareMedia();
    if (!ready) return;

    const cleanCode = roomCode.trim().toUpperCase();
    localStorage.setItem(CALL_KEY, cleanCode);
    setRoomCode(cleanCode);
    setStatus(t("video_call_connecting"));
    doctorCandidateIndexRef.current = 0;
    patientCandidateIndexRef.current = 0;

    setupPeerConnection(cleanCode);

    try {
      const connection = peerConnectionRef.current;

      if (role === "doctor") {
        const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        activeSessionIdRef.current = sessionId;

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        saveRoom(cleanCode, {
          roomCode: cleanCode,
          sessionId,
          offer: { type: offer.type, sdp: offer.sdp, sessionId },
          answer: null,
          doctorCandidates: [],
          patientCandidates: [],
          endedAt: null,
          updatedAt: Date.now()
        });
      } else {
        const room = readRoom(cleanCode);
        if (!room?.offer || !room?.sessionId) {
          teardownCall(false);
          setStatus(t("video_call_room_not_ready"));
          return;
        }

        activeSessionIdRef.current = room.sessionId;
        await connection.setRemoteDescription(
          new RTCSessionDescription(room.offer)
        );
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);

        room.answer = {
          type: answer.type,
          sdp: answer.sdp,
          sessionId: room.sessionId
        };
        room.endedAt = null;
        room.updatedAt = Date.now();
        saveRoom(cleanCode, room);
      }

      startRoomPoller(cleanCode);
      setInCall(true);
      setStatus(t("video_call_waiting"));
    } catch {
      teardownCall(false);
      setStatus(t("video_call_start_error"));
    }
  }

  function toggleAudio() {
    if (!localStreamRef.current) return;
    const next = !micOn;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    const next = !cameraOn;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraOn(next);
  }

  function teardownCall(markEnded) {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }

    if (markEnded && roomCode.trim()) {
      const cleanCode = roomCode.trim().toUpperCase();
      const room = readRoom(cleanCode);
      if (room && room.sessionId === activeSessionIdRef.current) {
        room.endedAt = Date.now();
        room.updatedAt = Date.now();
        saveRoom(cleanCode, room);
      }
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setRemoteJoined(false);
    activeSessionIdRef.current = "";
    doctorCandidateIndexRef.current = 0;
    patientCandidateIndexRef.current = 0;
  }

  function endCall() {
    teardownCall(true);
    setStatus(t("video_call_ended"));
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{t("video_call_title")}</h2>
        <span style={{ ...styles.badge, background: isOnline ? "#1f8b4c" : "#a61f2b" }}>
          {isOnline ? t("video_call_online") : t("video_call_offline")}
        </span>
      </div>

      <p style={styles.subtitle}>
        {role === "doctor" ? t("video_call_doctor_hint") : t("video_call_patient_hint")}
      </p>

      <div style={styles.card}>
        <label style={styles.label}>{t("video_call_room_code")}</label>
        <div style={styles.row}>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder={t("video_call_room_placeholder")}
            style={styles.input}
          />
          <button style={styles.secondaryBtn} onClick={generateRoomCode}>
            {t("video_call_generate")}
          </button>
        </div>
        <p style={styles.smallText}>
          {t("video_call_signed_as")} <strong>{user?.name || t(role)}</strong>
        </p>
      </div>

      <div style={styles.videoGrid}>
        <div style={styles.videoBox}>
          <p style={styles.videoLabel}>{t("video_call_you")}</p>
          <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
        </div>

        <div style={styles.videoBox}>
          <p style={styles.videoLabel}>{t("video_call_remote")}</p>
          <div style={styles.remoteWrap}>
            <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
            {!remoteJoined && (
              <div style={styles.remotePlaceholder}>
                {inCall ? t("video_call_waiting") : t("video_call_remote_idle")}
              </div>
            )}
          </div>
        </div>
      </div>

      {permissionError && <p style={styles.error}>{permissionError}</p>}
      {status && <p style={styles.status}>{status}</p>}

      <div style={styles.controls}>
        {!inCall ? (
          <button style={styles.primaryBtn} onClick={startCall} disabled={isPreparing || !isOnline}>
            {isPreparing ? t("video_call_connecting") : t("video_call_join")}
          </button>
        ) : (
          <>
            <button style={styles.secondaryBtn} onClick={toggleAudio}>
              {micOn ? t("video_call_mute") : t("video_call_unmute")}
            </button>
            <button style={styles.secondaryBtn} onClick={toggleVideo}>
              {cameraOn ? t("video_call_camera_off") : t("video_call_camera_on")}
            </button>
            <button style={styles.dangerBtn} onClick={endCall}>
              {t("video_call_end")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#e0f7fa"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  title: {
    color: "#0f2027",
    margin: 0
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "#304d58"
  },
  badge: {
    color: "#fff",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    marginBottom: 16
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 600
  },
  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  input: {
    flex: 1,
    minWidth: 180,
    border: "1px solid #c2d7dd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    textTransform: "uppercase"
  },
  smallText: {
    marginTop: 10,
    marginBottom: 0,
    color: "#36525a",
    fontSize: 14
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14
  },
  videoBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  videoLabel: {
    marginTop: 0,
    marginBottom: 8,
    fontWeight: 600,
    color: "#203a43"
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    background: "#0f2027",
    objectFit: "cover"
  },
  remoteWrap: {
    position: "relative"
  },
  remotePlaceholder: {
    position: "absolute",
    inset: 0,
    borderRadius: 8,
    background: "#12303a",
    color: "#e8f7fb",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: 12
  },
  controls: {
    marginTop: 18,
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  primaryBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    color: "#fff",
    background: "#0d8f56"
  },
  secondaryBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    color: "#fff",
    background: "#2c5364"
  },
  dangerBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    color: "#fff",
    background: "#c63a3a"
  },
  error: {
    color: "#b4232d",
    marginTop: 12,
    marginBottom: 0
  },
  status: {
    color: "#1b4552",
    marginTop: 12,
    marginBottom: 0
  }
};
