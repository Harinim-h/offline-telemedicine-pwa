import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAppointmentsForDoctorCloud
} from "../services/cloudData";
import { getAppointmentsForDoctor } from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const DOCTORS = [
  { id: "doc_kumar", name: "Dr. Kumar", email: "doctor@gmail.com" },
  { id: "doc_anjali", name: "Dr. Anjali", email: "anjali@gmail.com" },
  { id: "doc_arun", name: "Dr. Arun", email: "arun@gmail.com" }
];

function parseSymptoms(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[,\n;/]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function DoctorAnalytics() {
  const { t } = useTranslation();
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const doctor = useMemo(() => {
    const email = String(user?.email || "").toLowerCase();
    return DOCTORS.find((d) => d.email === email) || DOCTORS[0];
  }, [user]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    async function loadData() {
      try {
        const local = await getAppointmentsForDoctor(doctor.id);
        if (!active) return;
        setAppointments(local);

        if (hasSupabase && isOnline) {
          const cloud = await getAppointmentsForDoctorCloud(doctor.id);
          if (!active) return;
          setAppointments(cloud);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [doctor.id, isOnline]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const pending = appointments.filter((a) => a.status !== "completed").length;
    const video = appointments.filter((a) => a.consultType === "video").length;
    const text = appointments.filter((a) => a.consultType === "text").length;
    return { total, completed, pending, video, text };
  }, [appointments]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const labels = [];
    const byDay = {};

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      byDay[key] = 0;
    }

    appointments.forEach((a) => {
      const key = String(a?.date || "");
      if (byDay[key] !== undefined) byDay[key] += 1;
    });

    return labels.map((day) => ({ day, count: byDay[day] }));
  }, [appointments]);

  const symptomLeaders = useMemo(() => {
    const counter = {};
    appointments.forEach((a) => {
      parseSymptoms(a?.symptoms).forEach((symptom) => {
        counter[symptom] = (counter[symptom] || 0) + 1;
      });
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [appointments]);

  const maxWeekCount = Math.max(1, ...weeklyData.map((w) => w.count));

  return (
    <div style={page}>
      <h2 style={title}>{t("doctor_analytics_title")}</h2>
      <p style={subTitle}>
        {doctor.name} - {t("doctor_analytics_subtitle")}
      </p>
      {!isOnline && (
        <p style={notice}>{t("doctor_availability_offline")}</p>
      )}

      <div style={metrics}>
        <StatCard label={t("doctor_analytics_total_appointments")} value={stats.total} />
        <StatCard label={t("doctor_analytics_pending")} value={stats.pending} />
        <StatCard label={t("doctor_analytics_completed")} value={stats.completed} />
        <StatCard label={t("doctor_analytics_video_consults")} value={stats.video} />
        <StatCard label={t("doctor_analytics_text_consults")} value={stats.text} />
      </div>

      <div style={section}>
        <h3 style={sectionTitle}>{t("doctor_analytics_last7days")}</h3>
        {loading ? (
          <p>{t("loading")}</p>
        ) : (
          weeklyData.map((row) => (
            <div key={row.day} style={barRow}>
              <div style={barLabel}>{row.day.slice(5)}</div>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${(row.count / maxWeekCount) * 100}%`
                  }}
                />
              </div>
              <div style={barValue}>{row.count}</div>
            </div>
          ))
        )}
      </div>

      <div style={section}>
        <h3 style={sectionTitle}>{t("doctor_analytics_top_symptoms")}</h3>
        {symptomLeaders.length === 0 ? (
          <p>{t("doctor_analytics_no_symptom_data")}</p>
        ) : (
          symptomLeaders.map(([symptom, count]) => (
            <div key={symptom} style={listRow}>
              <span style={chip}>{symptom}</span>
              <strong>{count}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  marginTop: 0,
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  color: "#37545f",
  marginTop: 0,
  marginBottom: 14
};

const notice = {
  background: "#fff7e0",
  border: "1px solid #edd8a0",
  color: "#6b5408",
  borderRadius: 10,
  padding: "10px 12px"
};

const metrics = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12
};

const statCard = {
  background: "linear-gradient(145deg, #1f4959, #2f6276)",
  color: "#fff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 8px 16px rgba(0,0,0,0.18)"
};

const statValue = {
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 700
};

const statLabel = {
  fontSize: 13,
  marginTop: 4,
  opacity: 0.92
};

const section = {
  marginTop: 18,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
  padding: 14
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#203a43"
};

const barRow = {
  display: "grid",
  gridTemplateColumns: "58px 1fr 32px",
  alignItems: "center",
  gap: 10,
  marginBottom: 8
};

const barLabel = {
  fontSize: 13,
  color: "#33505b"
};

const barTrack = {
  background: "#ecf4f8",
  height: 12,
  borderRadius: 8,
  overflow: "hidden"
};

const barFill = {
  height: "100%",
  background: "linear-gradient(90deg, #2d8f8f, #4ab17f)",
  borderRadius: 8
};

const barValue = {
  textAlign: "right",
  color: "#1f4a57",
  fontWeight: 700
};

const listRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e8f0f4",
  padding: "8px 0"
};

const chip = {
  background: "#eef6f9",
  color: "#1f4a57",
  borderRadius: 20,
  padding: "4px 10px",
  fontSize: 13
};
