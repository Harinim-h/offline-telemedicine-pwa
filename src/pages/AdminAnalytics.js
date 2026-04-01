import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllAppointmentsCloud,
  getAllPatientRecordsCloud,
  getPharmaciesCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import { getAllAppointments, getAllPatientRecords } from "../services/localData";

const DOCTORS = [
  { id: "doc_kumar", name: "Dr. Kumar" },
  { id: "doc_anjali", name: "Dr. Anjali" },
  { id: "doc_arun", name: "Dr. Arun" }
];

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

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
        const [localAppointments, localPatients] = await Promise.all([
          getAllAppointments(),
          getAllPatientRecords()
        ]);
        if (!active) return;
        setAppointments(localAppointments);
        setPatients(localPatients);
        setPharmacies([]);

        if (hasSupabase && isOnline) {
          const [cloudAppointments, cloudPatients, cloudPharmacies] = await Promise.all([
            getAllAppointmentsCloud(),
            getAllPatientRecordsCloud(),
            getPharmaciesCloud()
          ]);
          if (!active) return;
          setAppointments(cloudAppointments);
          setPatients(cloudPatients);
          setPharmacies(cloudPharmacies);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 6000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const stats = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed").length;
    const pending = appointments.filter((a) => a.status !== "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = appointments.filter((a) => String(a.date) === today).length;
    return {
      patients: patients.length,
      appointments: appointments.length,
      completed,
      pending,
      cancelled,
      todayCount,
      doctors: DOCTORS.length,
      pharmacies: pharmacies.length
    };
  }, [appointments, patients, pharmacies]);

  const doctorLoad = useMemo(() => {
    const map = {};
    DOCTORS.forEach((doctor) => {
      map[doctor.id] = { name: doctor.name, total: 0, completed: 0 };
    });

    appointments.forEach((a) => {
      if (!map[a.doctorId]) return;
      map[a.doctorId].total += 1;
      if (a.status === "completed") map[a.doctorId].completed += 1;
    });

    return Object.values(map);
  }, [appointments]);

  const pharmacyStock = useMemo(() => {
    return pharmacies
      .map((p) => {
        const medicineMap = p?.medicines || {};
        const totalUnits = Object.values(medicineMap).reduce(
          (sum, value) => sum + Number(value || 0),
          0
        );
        return {
          id: p.id,
          name: p.name,
          medicinesCount: Object.keys(medicineMap).length,
          totalUnits
        };
      })
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [pharmacies]);

  return (
    <div style={page}>
      <h2 style={title}>{t("admin_analytics_title")}</h2>
      <p style={subTitle}>{t("admin_analytics_subtitle")}</p>
      {!isOnline && (
        <p style={notice}>{t("admin_offline_paused")}</p>
      )}

      <div style={metrics}>
        <StatCard label={t("admin_analytics_total_patients")} value={stats.patients} />
        <StatCard label={t("admin_analytics_total_appointments")} value={stats.appointments} />
        <StatCard label={t("admin_analytics_today_appointments")} value={stats.todayCount} />
        <StatCard label={t("admin_analytics_pending_cases")} value={stats.pending} />
        <StatCard label={t("admin_analytics_completed_cases")} value={stats.completed} />
        <StatCard label={t("admin_analytics_cancelled_cases")} value={stats.cancelled} />
        <StatCard label={t("admin_analytics_total_doctors")} value={stats.doctors} />
        <StatCard label={t("admin_analytics_total_pharmacies")} value={stats.pharmacies} />
      </div>

      <section style={section}>
        <h3 style={sectionTitle}>{t("admin_analytics_doctor_workload")}</h3>
        {loading ? (
          <p>{t("loading")}</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t("admin_analytics_table_doctor")}</th>
                  <th style={th}>{t("admin_analytics_table_appointments")}</th>
                  <th style={th}>{t("admin_analytics_table_completed")}</th>
                  <th style={th}>{t("admin_analytics_table_completion_rate")}</th>
                </tr>
              </thead>
              <tbody>
                {doctorLoad.map((row) => {
                  const completion = row.total ? Math.round((row.completed / row.total) * 100) : 0;
                  return (
                    <tr key={row.name}>
                      <td style={td}>{row.name}</td>
                      <td style={td}>{row.total}</td>
                      <td style={td}>{row.completed}</td>
                      <td style={td}>{completion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={section}>
        <h3 style={sectionTitle}>{t("admin_analytics_pharmacy_stock_summary")}</h3>
        {pharmacyStock.length === 0 ? (
          <p>{t("admin_analytics_no_pharmacy_stock_data")}</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t("admin_analytics_table_pharmacy")}</th>
                  <th style={th}>{t("admin_analytics_table_medicines_listed")}</th>
                  <th style={th}>{t("admin_analytics_table_total_units")}</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyStock.map((row) => (
                  <tr key={row.id}>
                    <td style={td}>{row.name}</td>
                    <td style={td}>{row.medicinesCount}</td>
                    <td style={td}>{row.totalUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  color: "#38545d",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12
};

const statCard = {
  background: "linear-gradient(145deg, #203a43, #2f6071)",
  color: "#fff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 8px 16px rgba(0,0,0,0.18)"
};

const statValue = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.1
};

const statLabel = {
  fontSize: 13,
  marginTop: 4
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

const tableWrap = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480
};

const th = {
  textAlign: "left",
  borderBottom: "1px solid #d7e4ea",
  background: "#eef5f8",
  color: "#1f4755",
  padding: "10px 12px"
};

const td = {
  borderBottom: "1px solid #edf3f6",
  color: "#2c4a54",
  padding: "10px 12px"
};
