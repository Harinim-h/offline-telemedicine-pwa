import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAppointmentCloud,
  getAllAppointmentsCloud,
  getAppointmentsForDoctorCloud,
  getAppointmentsForPatientCloud,
  updateAppointmentCloud
} from "../services/cloudData";
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

function generateConsultCode(doctorId) {
  const short = doctorId.replace("doc_", "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${short}-${rand}`;
}

export default function Appointments() {
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

    async function loadAppointments() {
      try {
        if (!shouldUseCloud) {
          setAppointments([]);
          return;
        }
        let data = [];
        if (role === "patient") {
          data = await getAppointmentsForPatientCloud(patientMobile, patientName);
        } else if (role === "doctor") {
          data = await getAppointmentsForDoctorCloud(activeDoctor?.id || "");
        } else {
          data = await getAllAppointmentsCloud();
        }
        if (!active) return;
        setAppointments(sortByCreatedAtDesc(data));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAppointments();
    const timer = setInterval(loadAppointments, 1500);

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
      alert("Please fill date, time and symptoms.");
      return;
    }
    if (!patientMobile) {
      alert("Patient mobile missing in session. Please logout and login again.");
      return;
    }
    if (!shouldUseCloud) {
      alert("Supabase cloud is required and internet must be available.");
      return;
    }

    setSaving(true);
    try {
      const tokenNo = Number(`${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}`);

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

      await createAppointmentCloud(payload);

      setBookForm((prev) => ({ ...prev, date: "", time: "", symptoms: "" }));
      alert("Token booked successfully.");
    } catch (error) {
      alert(`Booking failed: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function markTextConsult(appt) {
    try {
      if (!shouldUseCloud) {
        alert("Supabase cloud is required and internet must be available.");
        return;
      }
      const updates = {
        status: "in_consultation",
        consultType: "text",
        consultCode: ""
      };
      await updateAppointmentCloud(appt.id, updates);
      navigate(`/chat?appointmentId=${appt.id}`);
    } catch {
      alert("Unable to start text consultation.");
    }
  }

  async function markVideoConsult(appt) {
    try {
      if (!shouldUseCloud) {
        alert("Supabase cloud is required and internet must be available.");
        return;
      }
      const code = generateConsultCode(appt.doctorId);
      const updates = {
        status: "in_consultation",
        consultType: "video",
        consultCode: code,
        codeSharedAt: Date.now()
      };
      await updateAppointmentCloud(appt.id, updates);
      navigate(`/consult?code=${encodeURIComponent(code)}`);
    } catch {
      alert("Unable to start video consultation.");
    }
  }

  async function completeConsult(appt) {
    try {
      if (!shouldUseCloud) {
        alert("Supabase cloud is required and internet must be available.");
        return;
      }
      await updateAppointmentCloud(appt.id, { status: "completed" });
    } catch {
      alert("Unable to mark completed.");
    }
  }

  async function shareCode(appt) {
    if (!appt.consultCode) {
      alert("Generate video code first using 'Video Consult + Code'.");
      return;
    }

    const message = `Doctor call code for ${appt.patientName}: ${appt.consultCode}`;
    try {
      if (!shouldUseCloud) {
        alert("Supabase cloud is required and internet must be available.");
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: "Telemedicine Consultation Code",
          text: message
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(appt.consultCode);
        alert("Code copied. Share it with patient.");
      } else {
        alert(`Share this code: ${appt.consultCode}`);
      }

      await updateAppointmentCloud(appt.id, { codeSharedAt: Date.now() });
    } catch {
      alert("Unable to share code right now.");
    }
  }

  function renderPatientView() {
    return (
      <>
        {!shouldUseCloud && (
          <section style={styles.section}>
            <p style={styles.meta}>Supabase cloud not connected. Connect internet and configure env keys.</p>
          </section>
        )}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Book Token / Appointment</h3>
          <form onSubmit={bookToken} style={styles.formGrid}>
            <label style={styles.label}>
              Select Doctor
              <select
                value={bookForm.doctorId}
                onChange={(e) => setBookForm((p) => ({ ...p, doctorId: e.target.value }))}
                style={styles.input}
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.specialty}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.label}>
              Date
              <input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Time
              <input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.labelFull}>
              Symptoms / Issue
              <textarea
                value={bookForm.symptoms}
                onChange={(e) => setBookForm((p) => ({ ...p, symptoms: e.target.value }))}
                style={{ ...styles.input, minHeight: 90 }}
              />
            </label>
            <button style={styles.primaryBtn} disabled={saving} type="submit">
              {saving ? "Booking..." : "Book Token"}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>My Tokens</h3>
          {loading && <p>Loading...</p>}
          {!loading && appointments.length === 0 && <p>No appointments yet.</p>}
          {!loading &&
            appointments.map((a) => (
              <div style={styles.card} key={a.id}>
                <strong>
                  Token #{a.tokenNo || "-"} | {a.doctorName}
                </strong>
                <p style={styles.meta}>Date: {a.date} | Time: {a.time}</p>
                <p style={styles.meta}>Status: {a.status || "booked"}</p>
                <p style={styles.meta}>Symptoms: {a.symptoms}</p>
                {a.consultType === "video" && a.consultCode && (
                  <div style={styles.actions}>
                    <span style={styles.code}>Code: {a.consultCode}</span>
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => navigate(`/consult?code=${encodeURIComponent(a.consultCode)}`)}
                    >
                      Join Video
                    </button>
                  </div>
                )}
                {a.consultType === "text" && (
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => navigate(`/chat?appointmentId=${a.id}`)}
                  >
                    Open Text Consultation
                  </button>
                )}
              </div>
            ))}
        </section>
      </>
    );
  }

  function renderDoctorView() {
    return (
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Patient Queue {activeDoctor ? `- ${activeDoctor.name}` : ""}
        </h3>
        {loading && <p>Loading...</p>}
        {!loading && appointments.length === 0 && <p>No patients in queue.</p>}
        {!loading &&
          appointments.map((a) => (
            <div style={styles.card} key={a.id}>
              <strong>
                {a.patientName} ({a.patientMobile}) | Token #{a.tokenNo || "-"}
              </strong>
              <p style={styles.meta}>
                Time: {a.date} {a.time}
              </p>
              <p style={styles.meta}>Symptoms: {a.symptoms}</p>
              <p style={styles.meta}>Status: {a.status || "booked"}</p>
              <div style={styles.actions}>
                <button style={styles.secondaryBtn} onClick={() => markTextConsult(a)}>
                  Text Consult
                </button>
                <button style={styles.secondaryBtn} onClick={() => markVideoConsult(a)}>
                  Video Consult + Code
                </button>
                <button style={styles.secondaryBtn} onClick={() => shareCode(a)}>
                  Share Code
                </button>
                <button style={styles.dangerBtn} onClick={() => completeConsult(a)}>
                  Mark Completed
                </button>
              </div>
              {a.consultType === "video" && a.consultCode && (
                <p style={styles.code}>
                  Patient Code: {a.consultCode}
                  {a.codeSharedAt ? " | Shared" : ""}
                </p>
              )}
            </div>
          ))}
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Appointments & Consultation Queue</h2>
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
