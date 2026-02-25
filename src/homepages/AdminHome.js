import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getAllAppointmentsCloud,
  getAllPatientRecordsCloud,
  updateAppointmentCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

const DOCTORS = [
  { id: "doc_kumar", name: "Dr. Kumar" },
  { id: "doc_anjali", name: "Dr. Anjali" },
  { id: "doc_arun", name: "Dr. Arun" }
];

export default function AdminHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

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
      if (!hasSupabase || !isOnline) {
        if (active) {
          setPatients([]);
          setAppointments([]);
          setLoading(false);
        }
        return;
      }

      try {
        const [p, a] = await Promise.all([
          getAllPatientRecordsCloud(),
          getAllAppointmentsCloud()
        ]);
        if (!active) return;
        setPatients(p);
        setAppointments(a);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysAppointments = appointments.filter((a) => a.date === today);
    const activeConsults = appointments.filter(
      (a) => a.status === "in_consultation"
    );
    const completed = appointments.filter((a) => a.status === "completed");

    return {
      patients: patients.length,
      doctors: DOCTORS.length,
      today: todaysAppointments.length,
      active: activeConsults.length,
      completed: completed.length
    };
  }, [patients, appointments]);

  const doctorLoad = useMemo(() => {
    const map = {};
    DOCTORS.forEach((d) => {
      map[d.id] = { name: d.name, total: 0, active: 0 };
    });
    appointments.forEach((a) => {
      if (!map[a.doctorId]) return;
      map[a.doctorId].total += 1;
      if (a.status === "in_consultation") map[a.doctorId].active += 1;
    });
    return Object.values(map);
  }, [appointments]);

  async function forceComplete(id) {
    if (!hasSupabase || !isOnline) {
      alert("Cloud connection required.");
      return;
    }
    await updateAppointmentCloud(id, { status: "completed" });
  }

  return (
    <div style={page}>
      <h2 style={title}>{t("admin_dashboard")}</h2>

      {!hasSupabase && (
        <p style={notice}>Supabase not configured. Set env keys to enable admin features.</p>
      )}
      {hasSupabase && !isOnline && (
        <p style={notice}>You are offline. Admin live data sync is paused.</p>
      )}

      <div style={grid}>
        <MetricCard label="Total Patients" value={stats.patients} />
        <MetricCard label="Doctors" value={stats.doctors} />
        <MetricCard label="Appointments Today" value={stats.today} />
        <MetricCard label="Active Consults" value={stats.active} />
        <MetricCard label="Completed Cases" value={stats.completed} />
      </div>

      <Section title="Operational Controls">
        <div style={actions}>
          <button style={btn} onClick={() => navigate("/appointments")}>
            Open Appointment Queue
          </button>
          <button style={btn} onClick={() => navigate("/doctor/patients")}>
            View Patient Records
          </button>
          <button style={btn} onClick={() => navigate("/pharmacy")}>
            Pharmacy Monitor
          </button>
        </div>
      </Section>

      <Section title="Doctor Workload">
        {doctorLoad.map((d) => (
          <ListItem
            key={d.name}
            text={`${d.name} | Total: ${d.total} | Active: ${d.active}`}
          />
        ))}
      </Section>

      <Section title="Live Appointment Monitor">
        {loading && <p>Loading...</p>}
        {!loading && appointments.length === 0 && <p>No appointments found.</p>}
        {!loading &&
          appointments.slice(0, 10).map((a) => (
            <div key={a.id} style={panel}>
              <div style={row}>
                <strong>
                  {a.patientName} -> {a.doctorName}
                </strong>
                <span>{a.status || "booked"}</span>
              </div>
              <div style={rowSub}>
                {a.date} {a.time} | Token #{a.tokenNo || "-"}
              </div>
              <div style={rowSub}>Symptoms: {a.symptoms || "-"}</div>
              <div style={actions}>
                {a.consultCode && <code>{a.consultCode}</code>}
                {a.status !== "completed" && (
                  <button style={btnSmall} onClick={() => forceComplete(a.id)}>
                    Force Complete
                  </button>
                )}
              </div>
            </div>
          ))}
      </Section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={card}>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function ListItem({ text }) {
  return <div style={listItem}>{text}</div>;
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 14
};

const notice = {
  background: "#fff3cd",
  color: "#704f00",
  border: "1px solid #ffe08a",
  borderRadius: 10,
  padding: 10
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12
};

const card = {
  background: "linear-gradient(135deg, #203a43, #2c5364)",
  color: "#ffffff",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const metricValue = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.1
};

const metricLabel = {
  opacity: 0.9,
  marginTop: 6,
  fontSize: 13
};

const sectionTitle = {
  color: "#203a43",
  marginBottom: 8
};

const listItem = {
  background: "#ffffff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const actions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center"
};

const btn = {
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
  background: "#2c5364",
  color: "#fff"
};

const btnSmall = {
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  background: "#ad2e2e",
  color: "#fff"
};

const panel = {
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  padding: 12,
  marginBottom: 10
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10
};

const rowSub = {
  fontSize: 13,
  color: "#38535d",
  marginTop: 4
};
