import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import { getAllAppointmentsCloud } from "../services/cloudData";
import { getAllAppointments } from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const KNOWN_DOCTORS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    specialty: "General Medicine"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    specialty: "Dermatology"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    specialty: "Pediatrics"
  }
];

function isFutureSlot(date, time) {
  if (!date || !time) return false;
  const dt = new Date(`${date}T${time}`);
  return Number.isFinite(dt.getTime()) && dt.getTime() > Date.now();
}

export default function DoctorAvailability() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appointments, setAppointments] = useState([]);

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

    async function load() {
      try {
        const local = await getAllAppointments();
        if (active) setAppointments(local || []);

        if (hasSupabase && isOnline) {
          const cloud = await getAllAppointmentsCloud();
          if (active) setAppointments(cloud || []);
        }
      } catch {
        // Keep last known data.
      }
    }

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const doctorCards = useMemo(() => {
    const fromAppointments = new Map();
    appointments.forEach((a) => {
      const doctorId = String(a?.doctorId || "").trim();
      if (!doctorId) return;
      if (!fromAppointments.has(doctorId)) {
        fromAppointments.set(doctorId, {
          id: doctorId,
          name: a?.doctorName || doctorId,
          specialty: a?.doctorSpecialty || "General"
        });
      }
    });

    KNOWN_DOCTORS.forEach((d) => {
      if (!fromAppointments.has(d.id)) {
        fromAppointments.set(d.id, d);
      }
    });

    return [...fromAppointments.values()].map((doctor) => {
      const doctorAppointments = appointments.filter(
        (a) => String(a.doctorId || "") === doctor.id
      );
      const activeConsults = doctorAppointments.filter(
        (a) => String(a.status || "") === "in_consultation"
      ).length;
      const completedConsults = doctorAppointments.filter(
        (a) => String(a.status || "") === "completed"
      ).length;
      const upcoming = doctorAppointments
        .filter((a) => isFutureSlot(a.date, a.time))
        .sort((a, b) => {
          const aMs = new Date(`${a.date}T${a.time}`).getTime();
          const bMs = new Date(`${b.date}T${b.time}`).getTime();
          return aMs - bMs;
        });
      const nextSlot = upcoming[0] || null;
      const status = activeConsults > 0 ? "busy" : "available";

      return {
        ...doctor,
        status,
        activeConsults,
        completedConsults,
        totalConsults: doctorAppointments.length,
        queueSize: upcoming.length,
        nextSlot
      };
    });
  }, [appointments]);

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("doctor_availability_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 12 }}
      />
      <SpeakableText
        as="p"
        text={isOnline
          ? t("doctor_availability_live")
          : t("doctor_availability_offline")}
        style={styles.helper}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />

      <div style={styles.grid}>
        {doctorCards.map((doctor) => (
          <div key={doctor.id} style={styles.card}>
            <div style={styles.headerRow}>
              <h3 style={styles.name}>{t(`doctor_${doctor.id.split("_")[1]}`, doctor.name)}</h3>
              <span
                style={{
                  ...styles.badge,
                  background: doctor.status === "available" ? "#1f8b4c" : "#b45309"
                }}
              >
                {doctor.status === "available"
                  ? t("doctor_availability_status_available")
                  : t("doctor_availability_status_in_consultation")}
              </span>
            </div>
            <p style={styles.meta}><strong>{t("doctor_availability_specialty")}:</strong> {t(`specialty_${doctor.specialty.toLowerCase().replace(/\s+/g, "_")}`, doctor.specialty)}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_total_consults")}:</strong> {doctor.totalConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_active_consults")}:</strong> {doctor.activeConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_completed")}:</strong> {doctor.completedConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_upcoming_queue")}:</strong> {doctor.queueSize}</p>
            <p style={styles.meta}>
              <strong>{t("doctor_availability_next_slot")}:</strong>{" "}
              {doctor.nextSlot
                ? `${doctor.nextSlot.date} ${doctor.nextSlot.time}`
                : t("doctor_availability_no_upcoming_slot")}
            </p>
          </div>
        ))}
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
  title: {
    marginTop: 0,
    color: "#0f2027"
  },
  helper: {
    marginTop: 0,
    color: "#35515d"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  name: {
    margin: 0,
    color: "#203a43",
    fontSize: 18
  },
  badge: {
    color: "#fff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700
  },
  meta: {
    margin: "7px 0",
    color: "#2d4a53",
    fontSize: 14
  }
};
