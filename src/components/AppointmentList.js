import { useEffect, useState } from "react";
import { dbPromise } from "../utils/db";

export default function AppointmentList() {
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
          ? "All Appointments (Queue View)"
          : "Patient Appointments"}
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
          <div>Date: {a.date}</div>
          <div>Time: {a.time}</div>

          {(role === "doctor" || role === "admin") && (
            <div>Reason: {a.reason}</div>
          )}
        </div>
      ))}
    </div>
  );
}
