import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { dbPromise } from "../utils/db";

export default function AppointmentList() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const db = await dbPromise;
    const data = await db.getAll("appointments");
    setAppointments(data);
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>
        {role === "patient"
          ? t("appointment_list_all")
          : t("appointment_list_patient")}
      </h3>

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 8,
            padding: 8,
            background:
              role === "patient" ? "#f9f9f9" : "#eef5ff",
          }}
        >
          <strong>{a.patientName}</strong>
          <div>{t("appointments_date")}: {a.date}</div>
          <div>{t("appointments_time")}: {a.time}</div>

          {(role === "doctor" || role === "admin") && (
            <div>{t("appointment_list_reason")}: {a.reason}</div>
          )}
        </div>
      ))}
    </div>
  );
}
