import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import SpeakableText from "../components/SpeakableText";
import { hasSupabase, supabase } from "../supabaseClient";

const CALL_KEY = "telemedicine_call_room";

function buildIceServers() {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ];

  const turnUrlsRaw = String(process.env.REACT_APP_TURN_URLS || "").trim();
  const turnUsername = String(process.env.REACT_APP_TURN_USERNAME || "").trim();
  const turnCredential = String(process.env.REACT_APP_TURN_CREDENTIAL || "").trim();

  const turnUrls = turnUrlsRaw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential
    });
  }

  return servers;
}

const RTC_CONFIG = {
  iceServers: buildIceServers()
};

function channelNameForRoom(roomCode) {
  return `consult-room-${roomCode.replace(/[^A-Z0-9-]/g, "")}`;
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
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const channelRef = useRef(null);
  const activeRoomCodeRef = useRef("");
  const activeSessionIdRef = useRef("");
  const participantIdRef = useRef(
    `${role}_${Math.random().toString(36).slice(2, 10)}`
  );
  const offerRetryRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const candidateBacklogBySessionRef = useRef({});

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      teardownCall(false);
    };
  }, []);

  useEffect(() => {
    if (!codeFromUrl) return;
    setRoomCode(codeFromUrl);
    localStorage.setItem(CALL_KEY, codeFromUrl);
    setStatus("Room code loaded. Tap Join Call.");
  }, [codeFromUrl]);

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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      return true;
    } catch {
      setPermissionError(t("video_call_permission_error"));
      return false;
    } finally {
      setIsPreparing(false);
    }
  }

  function stopOfferRetry() {
    if (offerRetryRef.current) {
      clearInterval(offerRetryRef.current);
      offerRetryRef.current = null;
    }
  }

  function closeSignalChannel() {
    stopOfferRetry();
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  function clearPeerConnection() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    candidateBacklogBySessionRef.current = {};
  }

  function clearMedia() {
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
  }

  async function sendSignal(payload) {
    if (!channelRef.current) return false;
    const response = await channelRef.current.send({
      type: "broadcast",
      event: "signal",
      payload: {
        ...payload,
        senderId: participantIdRef.current,
        roomCode: activeRoomCodeRef.current,
        sentAt: Date.now()
      }
    });
    return response === "ok";
  }

  function stashCandidate(sessionId, candidate) {
    if (!sessionId || !candidate) return;
    if (!candidateBacklogBySessionRef.current[sessionId]) {
      candidateBacklogBySessionRef.current[sessionId] = [];
    }
    candidateBacklogBySessionRef.current[sessionId].push(candidate);
  }

  function moveBacklogToPending(sessionId) {
    if (!sessionId) return;
    const queued = candidateBacklogBySessionRef.current[sessionId] || [];
    if (queued.length > 0) {
      pendingCandidatesRef.current.push(...queued);
    }
    delete candidateBacklogBySessionRef.current[sessionId];
  }

  async function flushPendingCandidates() {
    const connection = peerConnectionRef.current;
    if (!connection || !connection.remoteDescription) return;

    const pending = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of pending) {
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore malformed or duplicate candidate
      }
    }
  }

  function setupPeerConnection() {
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.play().catch(() => {});
      }
      setRemoteJoined(true);
      setStatus(t("video_call_connected"));
    };

    connection.onicecandidate = async (event) => {
      if (!event.candidate || !activeSessionIdRef.current) return;
      await sendSignal({
        type: "candidate",
        senderRole: role,
        sessionId: activeSessionIdRef.current,
        candidate: event.candidate.toJSON()
      });
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      if (state === "connected") {
        setStatus(t("video_call_connected"));
      } else if (state === "failed" || state === "disconnected") {
        setStatus(t("video_call_connection_failed"));
      } else if (state === "connecting") {
        setStatus(t("video_call_connecting"));
      }
    };

    return connection;
  }

  async function startDoctorOfferBroadcast(connection, cleanCode) {
    const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    activeSessionIdRef.current = sessionId;

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    const offerPayload = {
      type: "offer",
      senderRole: "doctor",
      sessionId,
      offer: { type: offer.type, sdp: offer.sdp }
    };

    await sendSignal(offerPayload);
    stopOfferRetry();
    offerRetryRef.current = setInterval(() => {
      if (!peerConnectionRef.current?.currentRemoteDescription) {
        sendSignal(offerPayload);
      } else {
        stopOfferRetry();
      }
    }, 2000);

    setStatus(t("video_call_waiting"));
    setInCall(true);
    activeRoomCodeRef.current = cleanCode;
  }

  async function handleIncomingSignal(payload) {
    if (!payload) return;
    if (payload.senderId && payload.senderId === participantIdRef.current) return;
    if (payload.roomCode !== activeRoomCodeRef.current) return;

    const connection = peerConnectionRef.current;
    if (!connection) return;

    if (payload.type === "offer" && role !== "doctor") {
      if (connection.currentRemoteDescription) return;
      activeSessionIdRef.current = payload.sessionId;
      moveBacklogToPending(payload.sessionId);
      await connection.setRemoteDescription(
        new RTCSessionDescription(payload.offer)
      );
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      await sendSignal({
        type: "answer",
        senderRole: role,
        sessionId: payload.sessionId,
        answer: { type: answer.type, sdp: answer.sdp }
      });
      await flushPendingCandidates();
      setStatus(t("video_call_waiting"));
      setInCall(true);
      return;
    }

    if (
      payload.type === "answer" &&
      role === "doctor" &&
      payload.sessionId === activeSessionIdRef.current &&
      !connection.currentRemoteDescription
    ) {
      await connection.setRemoteDescription(
        new RTCSessionDescription(payload.answer)
      );
      stopOfferRetry();
      await flushPendingCandidates();
      setStatus(t("video_call_waiting"));
      return;
    }

    if (payload.type === "candidate") {
      if (!payload.sessionId || !payload.candidate) return;

      if (!activeSessionIdRef.current) {
        stashCandidate(payload.sessionId, payload.candidate);
        return;
      }

      if (payload.sessionId !== activeSessionIdRef.current) {
        stashCandidate(payload.sessionId, payload.candidate);
        return;
      }

      if (connection.remoteDescription) {
        try {
          await connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // ignore malformed or duplicate candidate
        }
      } else {
        pendingCandidatesRef.current.push(payload.candidate);
      }
      return;
    }

    if (
      payload.type === "end" &&
      payload.sessionId &&
      payload.sessionId === activeSessionIdRef.current
    ) {
      teardownCall(false);
      setStatus(t("video_call_ended"));
    }
  }

  async function subscribeToRoom(cleanCode) {
    if (!hasSupabase || !supabase || !isOnline) {
      setStatus(t("video_call_cloud_required"));
      return false;
    }

    closeSignalChannel();

    return new Promise((resolve) => {
      const channel = supabase.channel(channelNameForRoom(cleanCode), {
        config: { broadcast: { self: false } }
      });
      channelRef.current = channel;
      activeRoomCodeRef.current = cleanCode;

      channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
        try {
          await handleIncomingSignal(payload);
        } catch {
          setStatus(t("video_call_start_error"));
        }
      });

      channel.subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          resolve(true);
        } else if (
          subscribeStatus === "CLOSED" ||
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT"
        ) {
          setStatus(t("video_call_room_connect_error"));
          resolve(false);
        }
      });
    });
  }

  async function startCall() {
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setStatus(t("video_call_enter_room"));
      return;
    }

    localStorage.setItem(CALL_KEY, cleanCode);
    setRoomCode(cleanCode);
    setStatus(t("video_call_connecting"));
    setPermissionError("");
    setIsJoiningRoom(true);

    try {
      const mediaReady = await prepareMedia();
      if (!mediaReady) return;

      const subscribed = await subscribeToRoom(cleanCode);
      if (!subscribed) return;

      clearPeerConnection();
      const connection = setupPeerConnection();

      activeRoomCodeRef.current = cleanCode;
      setRemoteJoined(false);
      setInCall(true);

      if (role === "doctor") {
        await startDoctorOfferBroadcast(connection, cleanCode);
      } else {
        setStatus(t("video_call_waiting_host"));
      }
    } catch {
      setStatus(t("video_call_start_error"));
      teardownCall(false);
    } finally {
      setIsJoiningRoom(false);
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
    const sessionId = activeSessionIdRef.current;

    if (markEnded && sessionId) {
      sendSignal({
        type: "end",
        senderRole: role,
        sessionId
      });
    }

    closeSignalChannel();
    clearPeerConnection();
    clearMedia();

    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setRemoteJoined(false);
    setIsJoiningRoom(false);
    activeSessionIdRef.current = "";
    activeRoomCodeRef.current = "";
    setPermissionError("");
  }

  function endCall() {
    teardownCall(true);
    setStatus(t("video_call_ended"));
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <SpeakableText
          as="h2"
          text={t("video_call_title")}
          style={styles.title}
          wrapperStyle={{ display: "flex" }}
        />
        <span style={{ ...styles.badge, background: isOnline ? "#1f8b4c" : "#a61f2b" }}>
          {isOnline ? t("video_call_online") : t("video_call_offline")}
        </span>
      </div>

      <SpeakableText
        as="p"
        text={role === "doctor" ? t("video_call_doctor_hint") : t("video_call_patient_hint")}
        style={styles.subtitle}
        wrapperStyle={{ display: "flex", marginBottom: 18 }}
      />

      <div style={styles.card}>
        <label style={styles.label}>{t("video_call_room_code")}</label>
        <div style={styles.row}>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder={t("video_call_room_placeholder")}
            style={styles.input}
          />
        </div>
        <p style={styles.smallText}>
          {t("video_call_signed_as")} <strong>{user?.name || t(role)}</strong>
        </p>
      </div>

      <div style={styles.videoGrid}>
        <div style={styles.videoBox}>
          <p style={styles.videoLabel}>{t("video_call_you")}</p>
          <div style={styles.remoteWrap}>
            <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
            {!cameraOn && (
              <div style={styles.localVideoOffOverlay}>
                {t("video_call_camera_muted_status")}
              </div>
            )}
          </div>
          <div style={styles.mediaStatusRow}>
            <span style={micOn ? styles.statusChipOn : styles.statusChipOff}>
              {micOn ? t("video_call_mic_live_status") : t("video_call_mic_muted_status")}
            </span>
            <span style={cameraOn ? styles.statusChipOn : styles.statusChipOff}>
              {cameraOn ? t("video_call_camera_live_status") : t("video_call_camera_muted_status")}
            </span>
          </div>
        </div>

        <div style={styles.videoBox}>
          <p style={styles.videoLabel}>{t("video_call_remote")}</p>
          <div style={styles.remoteWrap}>
            <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
            {!remoteJoined && (
              <div style={styles.remotePlaceholder}>
                {role === "doctor" && inCall
                  ? t("video_call_waiting")
                  : !remoteJoined && inCall
                    ? t("video_call_waiting_host")
                    : t("video_call_remote_idle")}
              </div>
            )}
          </div>
        </div>
      </div>

      {permissionError && (
        <SpeakableText
          as="p"
          text={permissionError}
          style={styles.error}
          wrapperStyle={{ display: "flex", marginTop: 12 }}
        />
      )}
      {status && (
        <SpeakableText
          as="p"
          text={status}
          style={styles.status}
          wrapperStyle={{ display: "flex", marginTop: 12 }}
        />
      )}

      <div style={styles.controls}>
        {!inCall ? (
          <button
            type="button"
            style={styles.primaryBtn}
            onClick={startCall}
            disabled={isPreparing || isJoiningRoom}
          >
            {isPreparing || isJoiningRoom
              ? t("video_call_connecting")
              : t("video_call_join")}
          </button>
        ) : (
          <div style={styles.controlBar}>
            <button
              type="button"
              style={micOn ? styles.controlBtn : styles.controlBtnMuted}
              onClick={toggleAudio}
              aria-pressed={!micOn}
            >
              <span style={styles.controlTitle}>
                {micOn ? t("video_call_mute") : t("video_call_unmute")}
              </span>
              <span style={styles.controlMeta}>
                {micOn ? t("video_call_mic_live_status") : t("video_call_mic_muted_status")}
              </span>
            </button>
            <button
              type="button"
              style={cameraOn ? styles.controlBtn : styles.controlBtnMuted}
              onClick={toggleVideo}
              aria-pressed={!cameraOn}
            >
              <span style={styles.controlTitle}>
                {cameraOn ? t("video_call_camera_off") : t("video_call_camera_on")}
              </span>
              <span style={styles.controlMeta}>
                {cameraOn ? t("video_call_camera_live_status") : t("video_call_camera_muted_status")}
              </span>
            </button>
            <button type="button" style={styles.dangerBtn} onClick={endCall}>
              <span style={styles.controlTitle}>{t("video_call_end")}</span>
              <span style={styles.controlMeta}>{t("video_call_leave_status")}</span>
            </button>
          </div>
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#dfe9ec",
    background: "rgba(15, 32, 39, 0.7)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14
  },
  localVideoOffOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#f7fbfc",
    background: "rgba(15, 32, 39, 0.78)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontWeight: 600
  },
  mediaStatusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },
  statusChipOn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#e8f6ef",
    color: "#1f7a45",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  statusChipOff: {
    display: "inline-flex",
    alignItems: "center",
    background: "#fdecee",
    color: "#b3261e",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  controls: {
    marginTop: 18
  },
  controlBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    width: "100%"
  },
  primaryBtn: {
    background: "#00796b",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 15,
    cursor: "pointer"
  },
  secondaryBtn: {
    background: "#edf7f8",
    color: "#18444b",
    border: "1px solid #b9d7dc",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#edf7f8",
    color: "#18444b",
    border: "1px solid #b9d7dc",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlBtnMuted: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#fff1f1",
    color: "#8f1d1d",
    border: "1px solid #f1b7b7",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  dangerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlTitle: {
    fontWeight: 700
  },
  controlMeta: {
    fontSize: 12,
    opacity: 0.85
  },
  error: {
    color: "#a61f2b",
    fontWeight: 600
  },
  status: {
    color: "#1b4f59",
    fontWeight: 600
  }
};
