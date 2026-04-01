import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import { getSpeechLang } from "../utils/speech";
import {
  createAppointmentCloud,
  getAllAppointmentsCloud,
  getAppointmentsForDoctorCloud,
  getAppointmentsForPatientCloud,
  updateAppointmentCloud
} from "../services/cloudData";
import {
  createAppointment,
  deleteAppointmentById,
  getAllAppointments,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointmentById
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const DOCTORS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    specialty: "General Medicine",
    email: "doctor@gmail.com"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    specialty: "Dermatology",
    email: "anjali@gmail.com"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    specialty: "Pediatrics",
    email: "arun@gmail.com"
  }
];

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const aMs = Number(a?.createdAt || 0);
    const bMs = Number(b?.createdAt || 0);
    return bMs - aMs;
  });
}

function sortQueueBySchedule(items) {
  return [...items].sort((a, b) => {
    const aSlot = new Date(`${a?.date || ""}T${a?.time || "00:00"}`).getTime();
    const bSlot = new Date(`${b?.date || ""}T${b?.time || "00:00"}`).getTime();

    const aValid = Number.isFinite(aSlot);
    const bValid = Number.isFinite(bSlot);
    if (aValid && bValid && aSlot !== bSlot) return aSlot - bSlot;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;

    const aCreated = Number(a?.createdAt || 0);
    const bCreated = Number(b?.createdAt || 0);
    if (aCreated !== bCreated) return aCreated - bCreated;

    const aToken = Number(a?.tokenNo || 0);
    const bToken = Number(b?.tokenNo || 0);
    return aToken - bToken;
  });
}

function dedupeAppointments(items) {
  const map = new Map();
  for (const appt of items || []) {
    const cloudKey =
      appt?.cloudId !== undefined && appt?.cloudId !== null
        ? `cloud:${String(appt.cloudId)}`
        : "";
    const fallbackKey = `local:${String(appt?.patientMobile || "").trim()}|${String(
      appt?.doctorId || ""
    ).trim()}|${String(appt?.date || "").trim()}|${String(appt?.time || "").trim()}|${String(
      appt?.symptoms || ""
    ).trim()}`;
    const key = cloudKey || fallbackKey;

    const prev = map.get(key);
    if (!prev) {
      map.set(key, appt);
      continue;
    }

    const prevUpdated = Number(prev?.updatedAt || prev?.createdAt || 0);
    const nextUpdated = Number(appt?.updatedAt || appt?.createdAt || 0);
    if (nextUpdated >= prevUpdated) {
      map.set(key, appt);
    }
  }

  return [...map.values()];
}

function generateConsultCode(doctorId) {
  const short = doctorId.replace("doc_", "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${short}-${rand}`;
}

function sameAppointment(a, b) {
  return (
    String(a?.patientMobile || "").trim() === String(b?.patientMobile || "").trim() &&
    String(a?.doctorId || "").trim() === String(b?.doctorId || "").trim() &&
    String(a?.date || "").trim() === String(b?.date || "").trim() &&
    String(a?.time || "").trim() === String(b?.time || "").trim() &&
    String(a?.symptoms || "").trim() === String(b?.symptoms || "").trim()
  );
}

function generateTokenNo(existingAppointments, doctorId, date) {
  const active = (existingAppointments || []).filter((a) => {
    const status = String(a?.status || "").toLowerCase();
    return (
      String(a?.doctorId || "") === String(doctorId || "") &&
      String(a?.date || "") === String(date || "") &&
      status !== "cancelled" &&
      status !== "completed"
    );
  });

  // Collapse obvious duplicate rows from earlier sync bugs.
  const uniqueBySlot = new Map();
  for (const a of active) {
    const key = [
      String(a?.patientMobile || "").trim(),
      String(a?.doctorId || "").trim(),
      String(a?.date || "").trim(),
      String(a?.time || "").trim()
    ].join("|");
    if (!uniqueBySlot.has(key)) uniqueBySlot.set(key, a);
  }

  return uniqueBySlot.size + 1;
}

function getChatAppointmentId(appt) {
  return appt?.cloudId || appt?.id;
}

export default function Appointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const activeDoctor = useMemo(() => {
    if (role !== "doctor") return null;
    const email = (user?.email || "").toLowerCase();
    return DOCTORS.find((d) => d.email === email) || DOCTORS[0];
  }, [role, user]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSymptomListening, setIsSymptomListening] = useState(false);
  const [bookForm, setBookForm] = useState({
    doctorId: DOCTORS[0].id,
    date: "",
    time: "",
    symptoms: ""
  });
  const patientMobile = String(
    user?.mobile || sessionStorage.getItem("patientMobile") || ""
  ).trim();
  const patientName = String(user?.name || "Patient").trim();
  const shouldUseCloud = hasSupabase && isOnline;

  async function resolveCloudAppointmentId(appt) {
    if (!appt) return null;
    if (appt.cloudId) return appt.cloudId;
    if (!shouldUseCloud) return null;

    try {
      const cloudList = await getAllAppointmentsCloud();
      const matched = (cloudList || []).find((c) => sameAppointment(appt, c));
      if (!matched) return null;

      if (appt.id !== undefined && appt.id !== null) {
        try {
          await updateAppointmentById(appt.id, {
            cloudId: matched.id,
            syncStatus: "synced"
          });
        } catch {
          // non-fatal; resolution is still usable for chat navigation
        }
      }
      return matched.id;
    } catch {
      return null;
    }
  }

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
    let active = true;

    async function getLocalAppointmentsForRole() {
      if (role === "patient") {
        return getAppointmentsForPatient(patientMobile, patientName);
      }
      if (role === "doctor") {
        return getAppointmentsForDoctor(activeDoctor?.id || "");
      }
      return getAllAppointments();
    }

    async function syncPendingAppointmentsToCloud() {
      if (!shouldUseCloud) return;
      const allLocal = await getAllAppointments();
      const pending = allLocal.filter(
        (a) => !a.cloudId && String(a.syncStatus || "") === "pending_create"
      );

      for (const localAppt of pending) {
        const payload = {
          patientName: localAppt.patientName,
          patientMobile: localAppt.patientMobile,
          doctorId: localAppt.doctorId,
          doctorName: localAppt.doctorName,
          doctorSpecialty: localAppt.doctorSpecialty,
          date: localAppt.date,
          time: localAppt.time,
          symptoms: localAppt.symptoms,
          tokenNo: localAppt.tokenNo,
          status: localAppt.status || "booked",
          consultType: localAppt.consultType || "",
          consultCode: localAppt.consultCode || ""
        };

        try {
          const cloudCreated = await createAppointmentCloud(payload);
          await updateAppointmentById(localAppt.id, {
            ...cloudCreated,
            cloudId: cloudCreated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          console.warn("Pending appointment sync failed", error);
        }
      }

      const pendingUpdates = allLocal.filter(
        (a) =>
          (a.cloudId || a.id) &&
          String(a.syncStatus || "") === "pending_update"
      );

      for (const localAppt of pendingUpdates) {
        try {
          const updated = await updateAppointmentCloud(
            localAppt.cloudId || localAppt.id,
            {
              status: localAppt.status,
              consultType: localAppt.consultType,
              consultCode: localAppt.consultCode,
              codeSharedAt: localAppt.codeSharedAt
            }
          );
          await updateAppointmentById(localAppt.id, {
            ...updated,
            cloudId: updated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          console.warn("Pending appointment update sync failed", error);
        }
      }
    }

    async function mergeCloudAppointments(cloudAppointments) {
      const localAll = await getAllAppointments();
      for (const cloudAppt of cloudAppointments) {
        const byCloudId = localAll.find(
          (a) =>
            a.cloudId !== undefined &&
            a.cloudId !== null &&
            String(a.cloudId) === String(cloudAppt.id)
        );

        if (byCloudId) {
          await updateAppointmentById(byCloudId.id, {
            ...cloudAppt,
            cloudId: cloudAppt.id,
            syncStatus: "synced"
          });
          continue;
        }

        const likelySame = localAll.find((a) => !a.cloudId && sameAppointment(a, cloudAppt));
        if (likelySame) {
          await updateAppointmentById(likelySame.id, {
            ...cloudAppt,
            cloudId: cloudAppt.id,
            syncStatus: "synced"
          });
          continue;
        }

        const { id: _cloudRowId, ...restCloud } = cloudAppt;
        await createAppointment({
          ...restCloud,
          cloudId: cloudAppt.id,
          syncStatus: "synced"
        });
      }
    }

    async function pruneDeletedCloudAppointments(cloudAppointments) {
      if (!shouldUseCloud) return;
      const cloudIds = new Set(
        (cloudAppointments || []).map((a) => String(a?.id || "")).filter(Boolean)
      );
      const localAll = await getAllAppointments();

      const toDelete = localAll.filter((a) => {
        const cloudId = a?.cloudId;
        if (cloudId === undefined || cloudId === null || String(cloudId) === "") {
          return false; // local-only rows should not be auto-removed
        }
        const syncStatus = String(a?.syncStatus || "");
        if (syncStatus && syncStatus !== "synced") {
          return false; // keep unsynced local edits
        }
        return !cloudIds.has(String(cloudId));
      });

      for (const row of toDelete) {
        await deleteAppointmentById(row.id);
      }
    }

    async function loadAppointments() {
      try {
        const localNow = await getLocalAppointmentsForRole();
        if (active) setAppointments(sortByCreatedAtDesc(dedupeAppointments(localNow)));

        if (shouldUseCloud) {
          await syncPendingAppointmentsToCloud();

          let cloudData = [];
          if (role === "patient") {
            cloudData = await getAppointmentsForPatientCloud(patientMobile, patientName);
          } else if (role === "doctor") {
            cloudData = await getAppointmentsForDoctorCloud(activeDoctor?.id || "");
          } else {
            cloudData = await getAllAppointmentsCloud();
          }

          await pruneDeletedCloudAppointments(cloudData);
          await mergeCloudAppointments(cloudData);
          const mergedLocal = await getLocalAppointmentsForRole();
          if (active) setAppointments(sortByCreatedAtDesc(dedupeAppointments(mergedLocal)));
        }
      } catch (error) {
        console.warn("Load appointments failed", error);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadAppointments();
    const timer = setInterval(loadAppointments, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [role, activeDoctor, patientMobile, patientName, shouldUseCloud]);

  async function bookToken(e) {
    e.preventDefault();
    const selectedDoctor = DOCTORS.find((d) => d.id === bookForm.doctorId);
    if (!selectedDoctor) return;

    if (!bookForm.date || !bookForm.time || !bookForm.symptoms.trim()) {
      alert(t("appointments_fill_date_time_symptoms"));
      return;
    }
    if (!patientMobile) {
      alert(t("appointments_patient_mobile_missing"));
      return;
    }
    setSaving(true);
    try {
      const allLocal = await getAllAppointments();
      const tokenNo = generateTokenNo(
        allLocal,
        selectedDoctor.id,
        bookForm.date
      );

      const payload = {
        patientName,
        patientMobile,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: bookForm.date,
        time: bookForm.time,
        symptoms: bookForm.symptoms.trim(),
        tokenNo,
        status: "booked",
        consultType: "",
        consultCode: ""
      };

      const localId = await createAppointment({
        ...payload,
        syncStatus: "pending_create"
      });

      if (shouldUseCloud) {
        try {
          const cloudCreated = await createAppointmentCloud(payload);
          await updateAppointmentById(localId, {
            ...cloudCreated,
            cloudId: cloudCreated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          await updateAppointmentById(localId, { syncStatus: "pending_create" });
          console.warn("Cloud booking failed, kept local pending.", error);
        }
      }

      setBookForm((prev) => ({ ...prev, date: "", time: "", symptoms: "" }));
      alert(
        shouldUseCloud
          ? t("appointments_token_booked_success")
          : t("appointments_token_saved_offline")
      );
    } catch (error) {
      alert(`${t("appointments_booking_failed_prefix")} ${error?.message || t("unknown_error")}`);
    } finally {
      setSaving(false);
    }
  }

  function startSymptomVoiceTyping() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(
      sessionStorage.getItem("userLanguage") ||
        localStorage.getItem("language") ||
        "en"
    );
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsSymptomListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setBookForm((prev) => ({
          ...prev,
          symptoms: `${prev.symptoms} ${transcript}`.trim()
        }));
      }
    };

    recognition.onerror = () => {
      setIsSymptomListening(false);
    };

    recognition.onend = () => {
      setIsSymptomListening(false);
    };

    recognition.start();
  }

  async function markTextConsult(appt) {
    try {
      if (!shouldUseCloud) {
        await updateAppointmentById(appt.id, {
          status: "in_consultation",
          consultType: "text",
          consultCode: "",
          syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
        });
        navigate(`/chat?appointmentId=${encodeURIComponent(appt.id)}`);
        return;
      }
      const cloudAppointmentId =
        (await resolveCloudAppointmentId(appt)) || appt.cloudId || appt.id;
      if (!cloudAppointmentId) {
        alert(t("appointments_unable_start_text"));
        return;
      }
      const updates = {
        status: "in_consultation",
        consultType: "text",
        consultCode: ""
      };
      await updateAppointmentCloud(cloudAppointmentId, updates);
      navigate(`/chat?appointmentId=${encodeURIComponent(cloudAppointmentId)}`);
    } catch {
      alert(t("appointments_unable_start_text"));
    }
  }

  async function openTextConsult(appt) {
    if (!shouldUseCloud) {
      navigate(`/chat?appointmentId=${encodeURIComponent(appt.id)}`);
      return;
    }
    const cloudAppointmentId =
      (await resolveCloudAppointmentId(appt)) || appt.cloudId || appt.id;
    if (!cloudAppointmentId) {
      alert(t("appointments_unable_start_text"));
      return;
    }
    navigate(`/chat?appointmentId=${encodeURIComponent(cloudAppointmentId)}`);
  }

  async function cancelToken(appt) {
    if (String(appt?.status || "").toLowerCase() !== "booked") {
      alert("Only booked tokens can be cancelled.");
      return;
    }

    try {
      if (shouldUseCloud && (appt.cloudId || appt.id)) {
        const updated = await updateAppointmentCloud(appt.cloudId || appt.id, {
          status: "cancelled"
        });
        await updateAppointmentById(appt.id, {
          ...updated,
          cloudId: updated.id,
          syncStatus: "synced"
        });
      } else {
        await updateAppointmentById(appt.id, {
          status: "cancelled",
          syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
        });
      }
    } catch {
      alert(t("appointments_booking_failed_prefix"));
    }
  }

  async function markVideoConsult(appt) {
    try {
      if (!shouldUseCloud) {
        alert(t("appointments_cloud_required_online"));
        return;
      }
      const code = generateConsultCode(appt.doctorId);
      const updates = {
        status: "in_consultation",
        consultType: "video",
        consultCode: code,
        codeSharedAt: Date.now()
      };
      await updateAppointmentCloud(appt.cloudId || appt.id, updates);
      navigate(`/consult?code=${encodeURIComponent(code)}`);
    } catch {
      alert(t("appointments_unable_start_video"));
    }
  }

  async function completeConsult(appt) {
    try {
      if (shouldUseCloud && (appt.cloudId || appt.id)) {
        const updated = await updateAppointmentCloud(appt.cloudId || appt.id, {
          status: "completed"
        });
        await updateAppointmentById(appt.id, {
          ...updated,
          cloudId: updated.id,
          syncStatus: "synced"
        });
        return;
      }

      await updateAppointmentById(appt.id, {
        status: "completed",
        syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
      });
    } catch {
      alert(t("appointments_unable_mark_completed"));
    }
  }

  async function shareCode(appt) {
    try {
      if (!shouldUseCloud) {
        alert(t("appointments_cloud_required_online"));
        return;
      }

      const finalCode =
        appt.consultCode || generateConsultCode(appt.doctorId || "doc");
      const updatePayload = {
        consultType: "video",
        consultCode: finalCode,
        codeSharedAt: Date.now()
      };

      // Keep already-completed cases untouched; otherwise move to in_consultation.
      if (String(appt.status || "").toLowerCase() !== "completed") {
        updatePayload.status = "in_consultation";
      }

      await updateAppointmentCloud(appt.cloudId || appt.id, updatePayload);

      const message = `Doctor call code for ${appt.patientName}: ${finalCode}`;
      if (navigator.share) {
        await navigator.share({
          title: "Telemedicine Consultation Code",
          text: message
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(finalCode);
        alert(t("appointments_code_copied"));
      } else {
        alert(`${t("appointments_share_this_code")} ${finalCode}`);
      }
    } catch {
      alert(t("appointments_unable_share_code"));
    }
  }

  function renderPatientView() {
    return (
      <>
        {!shouldUseCloud && (
          <section style={styles.section}>
            <SpeakableText
              as="p"
              text={t("appointments_offline_mode_active")}
              style={styles.meta}
              wrapperStyle={{ display: "flex" }}
            />
          </section>
        )}
        <section style={styles.section}>
          <SpeakableText
            as="h3"
            text={t("appointments_book_title")}
            style={styles.sectionTitle}
            wrapperStyle={{ display: "flex" }}
          />
          <form onSubmit={bookToken} style={styles.formGrid}>
            <label style={styles.label}>
              {t("appointments_select_doctor")}
              <select
                value={bookForm.doctorId}
                onChange={(e) => setBookForm((p) => ({ ...p, doctorId: e.target.value }))}
                style={styles.input}
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t(`doctor_${d.id.split("_")[1]}` )} - {t(`specialty_${d.specialty.toLowerCase().replace(/\s+/g, "_")}`, d.specialty)}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.label}>
              {t("appointments_date")}
              <input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              {t("appointments_time")}
              <input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.labelFull}>
              {t("appointments_symptoms_issue")}
              <textarea
                value={bookForm.symptoms}
                onChange={(e) => setBookForm((p) => ({ ...p, symptoms: e.target.value }))}
                style={{ ...styles.input, minHeight: 90 }}
              />
              <button
                type="button"
                style={styles.voiceBtn}
                onClick={startSymptomVoiceTyping}
              >
                {isSymptomListening ? t("voice_listening") : t("symptom_speak_button")}
              </button>
            </label>
            <button style={styles.primaryBtn} disabled={saving} type="submit">
              {saving ? t("appointments_booking") : t("appointments_book_token")}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <SpeakableText
            as="h3"
            text={t("appointments_my_tokens")}
            style={styles.sectionTitle}
            wrapperStyle={{ display: "flex" }}
          />
          {loading && <p>{t("loading")}</p>}
          {!loading && appointments.length === 0 && <p>{t("appointments_none")}</p>}
          {!loading &&
            appointments.map((a) => (
              <div style={styles.card} key={a.id}>
                <strong>
                  {t("appointments_token_prefix")} #{a.tokenNo || "-"} | {t(`doctor_${a.doctorId?.split("_")[1]}`, a.doctorName)}
                </strong>
              <p style={styles.meta}>{t("appointments_date")}: {a.date} | {t("appointments_time")}: {a.time}</p>
              <p style={styles.meta}>{t("appointments_status")}: {a.status || t("appointments_booked")}</p>
              {a.syncStatus === "pending_create" && (
                <p style={styles.meta}>{t("appointments_sync_pending")}</p>
              )}
              <p style={styles.meta}>{t("appointments_symptoms")}: {a.symptoms}</p>
                {a.consultType === "video" && a.consultCode && (
                  <div style={styles.actions}>
                    <span style={styles.code}>{t("appointments_code")}: {a.consultCode}</span>
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => navigate(`/consult?code=${encodeURIComponent(a.consultCode)}`)}
                    >
                      {t("appointments_join_video")}
                    </button>
                  </div>
                )}
                {a.consultType === "text" && (
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => openTextConsult(a)}
                  >
                    {t("appointments_open_text_consultation")}
                  </button>
                )}
                {String(a.status || "").toLowerCase() === "booked" && (
                  <button
                    style={styles.dangerBtn}
                    onClick={() => cancelToken(a)}
                  >
                    Cancel Token
                  </button>
                )}
              </div>
            ))}
        </section>
      </>
    );
  }

  function renderDoctorView() {
    const queueTitle = `${t("appointments_patient_queue")}${activeDoctor ? ` - ${t(`doctor_${activeDoctor.id?.split("_")[1]}`, activeDoctor.name)}` : ""}`.trim();
    const notConsulted = sortQueueBySchedule(
      appointments.filter(
        (a) => String(a.status || "").toLowerCase() !== "completed"
      )
    );
    const consulted = sortQueueBySchedule(
      appointments.filter(
        (a) => String(a.status || "").toLowerCase() === "completed"
      )
    );

    const renderDoctorCard = (a) => (
      <div style={styles.card} key={a.id}>
        <strong>
          {a.patientName} ({a.patientMobile}) | {t("appointments_token_prefix")} #{a.tokenNo || "-"}
        </strong>
        <p style={styles.meta}>
          {t("appointments_time")}: {a.date} {a.time}
        </p>
        <p style={styles.meta}>{t("appointments_symptoms")}: {a.symptoms}</p>
        <p style={styles.meta}>{t("appointments_status")}: {a.status || t("appointments_booked")}</p>
        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={() => markTextConsult(a)}>
            {t("appointments_text_consult")}
          </button>
          <button style={styles.secondaryBtn} onClick={() => markVideoConsult(a)}>
            {t("appointments_video_consult_code")}
          </button>
          <button style={styles.secondaryBtn} onClick={() => shareCode(a)}>
            {t("appointments_share_code")}
          </button>
          {String(a.status || "").toLowerCase() !== "completed" && (
            <button style={styles.dangerBtn} onClick={() => completeConsult(a)}>
              {t("appointments_mark_completed")}
            </button>
          )}
        </div>
        {a.consultType === "video" && a.consultCode && (
          <p style={styles.code}>
            {t("appointments_patient_code")}: {a.consultCode}
            {a.codeSharedAt ? ` | ${t("appointments_shared")}` : ""}
          </p>
        )}
      </div>
    );

    return (
      <section style={styles.section}>
        <SpeakableText
          as="h3"
          text={queueTitle}
          style={styles.sectionTitle}
          wrapperStyle={{ display: "flex" }}
        />
        {loading && <p>{t("loading")}</p>}
        {!loading && appointments.length === 0 && <p>{t("appointments_no_patients_queue")}</p>}
        {!loading && appointments.length > 0 && (
          <div style={styles.doctorSplit}>
            <div style={styles.doctorColumn}>
              <h4 style={styles.subHeader}>{t("appointments_not_consulted")}</h4>
              {notConsulted.length === 0 && (
                <p style={styles.doctorEmpty}>{t("appointments_no_pending_consultations")}</p>
              )}
              {notConsulted.map(renderDoctorCard)}
            </div>

            <div style={styles.doctorColumn}>
              <h4 style={styles.subHeader}>{t("appointments_consulted")}</h4>
              {consulted.length === 0 && (
                <p style={styles.doctorEmpty}>{t("appointments_no_completed_consultations")}</p>
              )}
              {consulted.map(renderDoctorCard)}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("appointments_page_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 16 }}
      />
      {role === "patient" ? renderPatientView() : renderDoctorView()}
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
    marginBottom: 16,
    color: "#0f2027"
  },
  section: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    marginBottom: 14
  },
  sectionTitle: {
    marginTop: 0,
    color: "#203a43"
  },
  subHeader: {
    margin: "14px 0 8px",
    color: "#1f4855"
  },
  doctorSplit: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 14,
    alignItems: "start"
  },
  doctorColumn: {
    background: "#f4fbfd",
    border: "1px solid #d5e8ee",
    borderRadius: 10,
    padding: 10
  },
  doctorEmpty: {
    margin: "6px 0 10px",
    color: "#4a6570"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14
  },
  labelFull: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    gridColumn: "1 / -1"
  },
  input: {
    border: "1px solid #b9cfd6",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  card: {
    border: "1px solid #d0e0e6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    background: "#f8fdff"
  },
  meta: {
    margin: "4px 0",
    color: "#2f4a53",
    fontSize: 14
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8
  },
  code: {
    fontWeight: 700,
    color: "#0d3f4e",
    margin: "8px 0 0"
  },
  primaryBtn: {
    border: "none",
    background: "#0d8f56",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    width: "fit-content"
  },
  voiceBtn: {
    border: "none",
    background: "#0f766e",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    width: "fit-content",
    marginTop: 8
  },
  secondaryBtn: {
    border: "none",
    background: "#2c5364",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer"
  },
  dangerBtn: {
    border: "none",
    background: "#b23a3a",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer"
  }
};
