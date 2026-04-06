import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import {
  getAppointmentsForPatientCloud,
  getPatientUserCloud,
  updatePatientUserCloud
} from "../services/cloudData";
import {
  getAppointmentsForPatient,
  getPatientUserByMobile,
  savePatientUserLocal
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";

export default function Profile() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState({ type: "", text: "" });
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  const patientMobile = String(
    profile?.mobile || sessionStorage.getItem("patientMobile") || ""
  ).trim();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function syncProfileToCloud() {
      if (!hasSupabase || !isOnline || !patientMobile) return;
      try {
        const localProfile = await getPatientUserByMobile(patientMobile);
        if (!localProfile || String(localProfile?.syncStatus || "") !== "pending_update") {
          return;
        }
        const synced = await updatePatientUserCloud(patientMobile, localProfile);
        await savePatientUserLocal({ ...synced, syncStatus: "synced" });
        if (!active) return;
        sessionStorage.setItem(
          "userData",
          JSON.stringify({ ...synced, name: String(synced?.name || "").trim() || t("patient") })
        );
        setProfile((prev) => ({ ...prev, ...synced }));
      } catch {
        // Keep local pending state until the next online sync attempt.
      }
    }

    async function refreshProfile() {
      try {
        const localProfile = await getPatientUserByMobile(patientMobile);
        if (localProfile && active) {
          setProfile((prev) => ({ ...prev, ...localProfile }));
        }
        if (hasSupabase && isOnline) {
          const cloudProfile = await getPatientUserCloud(patientMobile);
          if (cloudProfile) {
            await savePatientUserLocal({ ...cloudProfile, syncStatus: "synced" });
            if (active) {
              setProfile((prev) => ({ ...prev, ...cloudProfile }));
            }
          }
        }
      } catch {
        // Keep local profile if refresh fails
      }
    }

    async function loadAppointments() {
      try {
        const local = await getAppointmentsForPatient(patientMobile, profile?.name || "");
        if (active) setAppointments(local || []);
        if (hasSupabase && isOnline) {
          const cloud = await getAppointmentsForPatientCloud(
            patientMobile,
            profile?.name || ""
          );
          if (active) setAppointments(cloud || []);
        }
      } catch {
        // keep existing data if fetch fails
      }
    }

    syncProfileToCloud().then(refreshProfile).then(loadAppointments);
    return () => {
      active = false;
    };
  }, [isOnline, patientMobile, profile?.name, t]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const active = appointments.filter((a) => a.status === "in_consultation").length;
    const upcoming = appointments.filter((a) => {
      if (!a.date || !a.time) return false;
      const dt = new Date(`${a.date}T${a.time}`);
      return Number.isFinite(dt.getTime()) && dt.getTime() > Date.now();
    }).length;
    return { total, completed, active, upcoming };
  }, [appointments]);

  async function saveProfile() {
    if (!patientMobile) {
      setSaveState({ type: "error", text: t("profile_mobile_not_found") });
      return;
    }
    const name = String(profile?.name || "").trim();
    const age = String(profile?.age || "").trim();
    if (!name || !age) {
      setSaveState({ type: "error", text: t("profile_name_age_required") });
      return;
    }

    setSaving(true);
    setSaveState({ type: "", text: "" });
    try {
      const updated = {
        ...profile,
        role: "patient",
        mobile: patientMobile,
        name,
        age
      };
      if (hasSupabase && isOnline) {
        const synced = await updatePatientUserCloud(patientMobile, updated);
        await savePatientUserLocal({ ...synced, syncStatus: "synced" });
        sessionStorage.setItem("userData", JSON.stringify(synced));
        setProfile(synced);
        setSaveState({ type: "success", text: t("profile_updated_success") });
        return;
      }

      await savePatientUserLocal({ ...updated, syncStatus: "pending_update" });
      sessionStorage.setItem("userData", JSON.stringify(updated));
      setProfile(updated);
      setSaveState({
        type: "success",
        text: t(
          "profile_saved_offline",
          "Profile saved offline. It will sync when internet is available."
        )
      });
    } catch {
      setSaveState({
        type: "error",
        text: t("profile_update_failed")
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("profile_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 12 }}
      />
      <SpeakableText
        as="p"
        text={isOnline
          ? t("profile_online_text")
          : t("profile_offline_text")}
        style={styles.sub}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {String(profile?.name || "P").trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={styles.cardTitle}>{profile?.name || t("patient")}</h3>
              <p style={styles.headerMeta}>{t("profile_patient_id")}: {patientMobile || "N/A"}</p>
            </div>
          </div>

          <div style={styles.chipsRow}>
            <span style={styles.chip}>{t("profile_role")}: {t("patient")}</span>
            <span style={styles.chip}>{isOnline ? t("profile_online") : t("profile_offline")}</span>
          </div>

          <label style={styles.label}>
            {t("name")}
            <input
              style={styles.input}
              value={profile?.name || ""}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label style={styles.label}>
            {t("age")}
            <input
              type="number"
              min="0"
              style={styles.input}
              value={profile?.age || ""}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
            />
          </label>
          <label style={styles.label}>
            {t("mobile")}
            <input style={styles.inputDisabled} value={patientMobile} disabled />
          </label>
          <button style={styles.primaryBtn} onClick={saveProfile} disabled={saving}>
            {saving ? t("profile_updating") : t("profile_update_button")}
          </button>
          {saveState.text ? (
            <p
              style={
                saveState.type === "success"
                  ? styles.successMsg
                  : styles.errorMsg
              }
            >
              {saveState.text}
            </p>
          ) : null}
        </section>

        <section style={styles.card}>
          <SpeakableText
            as="h3"
            text={t("profile_care_summary")}
            style={styles.cardTitle}
            wrapperStyle={{ display: "flex", marginBottom: 8 }}
          />
          <div style={styles.summaryGrid}>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_total")}</p>
              <p style={styles.summaryValue}>{stats.total}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_upcoming")}</p>
              <p style={styles.summaryValue}>{stats.upcoming}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_active")}</p>
              <p style={styles.summaryValue}>{stats.active}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_completed")}</p>
              <p style={styles.summaryValue}>{stats.completed}</p>
            </div>
          </div>
        </section>
      </div>

      <section style={{ ...styles.card, marginTop: 14 }}>
        <SpeakableText
          as="h3"
          text={t("profile_recent_appointments")}
          style={styles.cardTitle}
          wrapperStyle={{ display: "flex", marginBottom: 8 }}
        />
        {appointments.length === 0 ? (
          <p style={styles.empty}>{t("profile_no_appointments")}</p>
        ) : (
          appointments
            .slice()
            .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
            .slice(0, 5)
            .map((a) => (
              <div key={a.id} style={styles.appointmentItem}>
                <div>
                  <p style={styles.itemTitle}>{a.doctorName || t("doctor")}</p>
                  <p style={styles.itemMeta}>
                    {a.date || "-"} {a.time || "-"} | Token #{a.tokenNo || "-"}
                  </p>
                </div>
                <span style={styles.itemStatus}>{a.status || t("appointments_booked")}</span>
              </div>
            ))
        )}
        </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#e0f7fa"
  },
  title: {
    margin: 0,
    color: "#0f2027"
  },
  sub: {
    marginTop: 8,
    color: "#35515d"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  cardTitle: {
    marginTop: 0,
    color: "#203a43"
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2c5364, #4b7b8d)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 22
  },
  headerMeta: {
    margin: 0,
    color: "#4d6872",
    fontSize: 13
  },
  chipsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10
  },
  chip: {
    background: "#e8f4f8",
    color: "#1f4b59",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 10,
    color: "#264851",
    fontSize: 14
  },
  input: {
    border: "1px solid #b9cfd6",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  inputDisabled: {
    border: "1px solid #d2dfe4",
    background: "#f4f8fa",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  primaryBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#2c5364",
    color: "#fff",
    cursor: "pointer"
  },
  successMsg: {
    margin: "10px 0 0",
    color: "#1f7a45",
    background: "#e9f7ef",
    border: "1px solid #bfe3cf",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13
  },
  errorMsg: {
    margin: "10px 0 0",
    color: "#a61f2b",
    background: "#fdecef",
    border: "1px solid #f1c1c8",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
    gap: 10
  },
  summaryTile: {
    background: "#f3f9fb",
    border: "1px solid #d8e8ee",
    borderRadius: 10,
    padding: 10
  },
  summaryLabel: {
    margin: 0,
    color: "#4a6872",
    fontSize: 12,
    fontWeight: 600
  },
  summaryValue: {
    margin: "4px 0 0",
    color: "#103847",
    fontSize: 22,
    fontWeight: 700
  },
  empty: {
    margin: "6px 0",
    color: "#54727d"
  },
  appointmentItem: {
    border: "1px solid #d8e8ee",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    background: "#fbfeff",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center"
  },
  itemTitle: {
    margin: 0,
    color: "#153d4a",
    fontWeight: 700
  },
  itemMeta: {
    margin: "4px 0 0",
    color: "#4d6a74",
    fontSize: 13
  },
  itemStatus: {
    background: "#e9f5ee",
    color: "#1d6d45",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize"
  }
};
