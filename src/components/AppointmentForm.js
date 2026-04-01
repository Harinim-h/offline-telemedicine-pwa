import { useState } from "react";
import { useTranslation } from "react-i18next";
import { dbPromise } from "../utils/db";

export default function AppointmentForm() {
  const { t } = useTranslation();
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

    alert(t("appointment_form_saved_offline"));
    setName("");
    setDate("");
    setReason("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>{t("appointment_form_title")}</h3>

      <input
        placeholder={t("patient_name")}
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
        placeholder={t("appointment_list_reason")}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br /><br />

      <button onClick={saveAppointment}>
        {t("appointment_form_title")}
      </button>
    </div>
  );
}
