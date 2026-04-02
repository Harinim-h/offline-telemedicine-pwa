import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getAllAppointmentsCloud,
  getAllPatientRecordsCloud,
  updateAppointmentCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import { addDoctorCredential, getAllDoctors } from "../services/localData";

const DEFAULT_DOCTORS = [
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

function mergeDoctorLists(base, extra) {
  const map = new Map();
  (base || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (key) map.set(String(key), doc);
  });
  (extra || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (!key) return;
    const existing = map.get(String(key));
    map.set(String(key), { ...existing, ...doc });
  });
  return Array.from(map.values());
}

export default function AdminHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState(DEFAULT_DOCTORS);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "General Medicine"
  });
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState("");

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

    async function loadDoctors() {
      try {
        const localDoctors = await getAllDoctors();
        if (!active) return;
        setDoctorList(mergeDoctorLists(DEFAULT_DOCTORS, localDoctors));
      } catch {
        if (active) setDoctorList(DEFAULT_DOCTORS);
      }
    }

    loadDoctors();
    return () => {
      active = false;
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
      doctors: doctorList.length,
      today: todaysAppointments.length,
      active: activeConsults.length,
      completed: completed.length
    };
  }, [patients, appointments, doctorList]);

  const doctorLoad = useMemo(() => {
    const map = {};
    doctorList.forEach((d) => {
      map[d.id] = { name: d.name, total: 0, active: 0 };
    });
    appointments.forEach((a) => {
      if (!map[a.doctorId]) {
        map[a.doctorId] = {
          name: a.doctorName || a.doctorId || t("doctor", "Doctor"),
          total: 0,
          active: 0
        };
      }
      map[a.doctorId].total += 1;
      if (a.status === "in_consultation") map[a.doctorId].active += 1;
    });
    return Object.values(map);
  }, [appointments, doctorList, t]);

  function handleDoctorChange(e) {
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    setDoctorMessage("");
    setDoctorSaving(true);
    try {
      const created = await addDoctorCredential(doctorForm);
      setDoctorList((prev) => mergeDoctorLists(prev, [created]));
      setDoctorForm({
        name: "",
        email: "",
        password: "",
        specialty: "General Medicine"
      });
      setDoctorMessage(t("admin_doctor_created_success", "Doctor added successfully."));
    } catch (error) {
      const msg = String(error?.message || "");
      if (msg.includes("doctor-already-exists")) {
        setDoctorMessage(t("admin_doctor_exists", "Doctor already exists."));
      } else if (msg.includes("doctor-email-required")) {
        setDoctorMessage(t("admin_doctor_email_required", "Doctor email is required."));
      } else {
        setDoctorMessage(
          t("admin_doctor_create_failed", "Unable to add doctor. Please check details.")
        );
      }
    } finally {
      setDoctorSaving(false);
    }
  }

  async function forceComplete(id) {
    if (!hasSupabase || !isOnline) {
      alert(t("admin_cloud_connection_required"));
      return;
    }
    await updateAppointmentCloud(id, { status: "completed" });
  }

  return (
    <div style={page}>
      <h2 style={title}>{t("admin_dashboard")}</h2>

      {!hasSupabase && (
        <p style={notice}>{t("admin_not_configured")}</p>
      )}
      {hasSupabase && !isOnline && (
        <p style={notice}>{t("admin_offline_paused")}</p>
      )}

      <div style={grid}>
        <MetricCard label={t("admin_total_patients_short")} value={stats.patients} />
        <MetricCard label={t("admin_doctors_short")} value={stats.doctors} />
        <MetricCard label={t("admin_appointments_today_short")} value={stats.today} />
        <MetricCard label={t("admin_active_consults")} value={stats.active} />
        <MetricCard label={t("admin_completed_cases")} value={stats.completed} />
      </div>

      <Section title={t("admin_operational_controls")}>
        <div style={actions}>
          <button style={btn} onClick={() => navigate("/admin-analytics")}>
            {t("admin_analytics_button")}
          </button>
          <button style={btn} onClick={() => navigate("/appointments")}>
            {t("admin_open_appointment_queue")}
          </button>
          <button style={btn} onClick={() => navigate("/doctor/patients")}>
            {t("admin_view_patient_records")}
          </button>
          <button style={btn} onClick={() => navigate("/pharmacy")}>
            {t("admin_pharmacy_monitor")}
          </button>
        </div>
      </Section>

      <Section title={t("admin_add_doctor_title", "Add Doctor Login")}>
        <p style={hint}>
          {t(
            "admin_add_doctor_desc",
            "Create credentials for new doctors so they can log in and appear in booking lists."
          )}
        </p>
        <form style={formGrid} onSubmit={handleDoctorSubmit}>
          <label style={label}>
            {t("admin_doctor_name", "Doctor Name")}
            <input
              name="name"
              value={doctorForm.name}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_email", "Email")}
            <input
              name="email"
              type="email"
              value={doctorForm.email}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_password", "Password")}
            <input
              name="password"
              type="text"
              value={doctorForm.password}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_specialty", "Specialty")}
            <input
              name="specialty"
              value={doctorForm.specialty}
              onChange={handleDoctorChange}
              style={input}
              placeholder={t("admin_doctor_specialty_placeholder", "General Medicine")}
            />
          </label>
          <button style={btn} type="submit" disabled={doctorSaving}>
            {doctorSaving
              ? t("admin_doctor_creating", "Saving...")
              : t("admin_doctor_create", "Add Doctor")}
          </button>
          {doctorMessage && <span style={hint}>{doctorMessage}</span>}
        </form>
      </Section>

      <Section title={t("admin_doctor_list_title", "Doctor Logins")}>
        {doctorList.length === 0 && (
          <p style={hint}>{t("admin_doctor_list_empty", "No doctors found yet.")}</p>
        )}
        {doctorList.map((doc) => (
          <div key={doc.email || doc.id} style={listItem}>
            <strong>{doc.name}</strong>
            <div style={rowSub}>
              {t("admin_doctor_email", "Email")}: {doc.email || "-"} |{" "}
              {t("admin_doctor_specialty", "Specialty")}: {doc.specialty || "-"}
            </div>
            <div style={rowSub}>
              {t("admin_doctor_password", "Password")}: {doc.password || "-"} |{" "}
              {t("admin_doctor_id", "ID")}: {doc.id || "-"}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t("admin_doctor_workload")}>
        {doctorLoad.map((d) => (
          <ListItem
            key={d.name}
            text={t("admin_doctor_workload_item", {
              name: d.name,
              total: d.total,
              active: d.active
            })}
          />
        ))}
      </Section>

      <Section title={t("admin_live_appointment_monitor")}>
        {loading && <p>{t("loading")}</p>}
        {!loading && appointments.length === 0 && <p>{t("admin_no_appointments_found")}</p>}
        {!loading &&
          appointments.slice(0, 10).map((a) => (
            <div key={a.id} style={panel}>
              <div style={row}>
                <strong>
                  {a.patientName} -> {t(`doctor_${a.doctorId?.split("_")[1]}`, a.doctorName)}
                </strong>
                <span>{t(`appointments_status_${a.status || "booked"}`)}</span>
              </div>
              <div style={rowSub}>
                {a.date} {a.time} | {t("appointments_code")}: {a.tokenNo || "-"}
              </div>
              <div style={rowSub}>{t("appointments_symptoms")}: {a.symptoms || "-"}</div>
              <div style={actions}>
                {a.consultCode && <code>{a.consultCode}</code>}
                {a.status !== "completed" && (
                  <button style={btnSmall} onClick={() => forceComplete(a.id)}>
                    {t("admin_force_complete")}
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

const hint = {
  color: "#38535d",
  fontSize: 13,
  marginBottom: 10
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
  alignItems: "end",
  marginBottom: 8
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14
};

const input = {
  border: "1px solid #b9cfd6",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14
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
