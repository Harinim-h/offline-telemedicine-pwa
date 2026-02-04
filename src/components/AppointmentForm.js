import { useState } from "react";
import { dbPromise } from "../utils/db";

export default function AppointmentForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const saveAppointment = async () => {
    const db = await dbPromise;
    await db.add("appointments", {
      name,
      date,
      reason,
      createdAt: new Date(),
      synced: false,
    });

    alert("Appointment saved offline ✅");
    setName("");
    setDate("");
    setReason("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Book Appointment</h3>

      <input
        placeholder="Patient Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br /><br />

      <button onClick={saveAppointment}>
        Book Appointment
      </button>
    </div>
  );
}
