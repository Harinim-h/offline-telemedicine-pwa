import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addPatientRecordCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function PatientForm({ onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    age: "",
    condition: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasSupabase || !navigator.onLine) {
      alert("Supabase cloud is required and internet must be available.");
      return;
    }
    await addPatientRecordCloud(form);

    alert(t("patient_added_success"));
    onClose();
  };

  return (
    <div>
      <h3>{t("add_patient_title")}</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("patient_name")}
          value={form.name}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="age"
          placeholder={t("patient_age")}
          value={form.age}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="condition"
          placeholder={t("patient_condition")}
          value={form.condition}
          onChange={handleChange}
          required
          style={input}
        />

        <button type="submit" style={btn}>
          {t("save_patient")}
        </button>
      </form>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  marginTop: 14,
  padding: 12,
  background: "#203a43",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};
