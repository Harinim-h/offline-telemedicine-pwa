import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addPatientRecordCloud } from "../services/cloudData";
import {
  addPatientRecord,
  upsertPatientRecord
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";

export default function AddPatient() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [additionalData, setAdditionalData] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!String(name || "").trim() || !String(age || "").trim() || !String(condition || "").trim()) {
        setMsg(t("add_patient_required_fields"));
        return;
      }
      const payload = {
        name,
        age,
        condition,
        additionalData
      };

      if (!hasSupabase || !navigator.onLine) {
        await addPatientRecord({
          ...payload,
          id: `local-patient-${Date.now()}`,
          syncStatus: "pending_create",
          cloudId: null
        });
        setMsg(
          t(
            "doctor_patients_saved_offline",
            "Patient record saved offline. It will sync when internet is available."
          )
        );
        setTimeout(() => navigate("/doctor/patients"), 1000);
        return;
      }

      const createdPatient = await addPatientRecordCloud(payload);
      await upsertPatientRecord({
        ...createdPatient,
        cloudId: createdPatient.id,
        syncStatus: "synced"
      });

      setMsg(t("patient_added_success"));
      setTimeout(() => navigate("/doctor/patients"), 1000);
    } catch (error) {
      const raw = String(error?.message || "").trim();
      const lowered = raw.toLowerCase();
      if (lowered.includes("row-level security") || String(error?.code || "") === "42501") {
        setMsg(t("add_patient_permission_denied"));
      } else if (lowered.includes("relation") || lowered.includes("patients")) {
        setMsg(t("add_patient_table_missing"));
      } else {
        setMsg(raw ? `${t("add_patient_unable_prefix")} ${raw}` : t("add_patient_error"));
      }
    }
  };

  return (
    <div style={page}>
      <div style={container}>
        <h2 style={title}>{t("add_patient_title")}</h2>
        <p style={subTitle}>{t("add_patient_subtitle")}</p>

        <form onSubmit={handleSubmit} style={card}>
          <div style={grid}>
            <label style={field}>
              <span style={label}>{t("name")}</span>
              <input
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={input}
              />
            </label>

            <label style={field}>
              <span style={label}>{t("age")}</span>
              <input
                placeholder={t("age")}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={input}
              />
            </label>

            <label style={{ ...field, gridColumn: "1 / -1" }}>
              <span style={label}>{t("condition")}</span>
              <input
                placeholder={t("condition")}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={input}
              />
            </label>

            <label style={{ ...field, gridColumn: "1 / -1" }}>
              <span style={label}>{t("additional_data_label")}</span>
              <textarea
                placeholder={t("additional_data_label")}
                value={additionalData}
                onChange={(e) => setAdditionalData(e.target.value)}
                style={{ ...input, minHeight: 110, resize: "vertical" }}
              />
            </label>
          </div>

          <button style={btn}>{t("save_patient")}</button>
          {msg ? <p style={msgStyle}>{msg}</p> : null}
        </form>
      </div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const container = {
  maxWidth: 980,
  margin: "0 auto"
};

const title = {
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  marginTop: 0,
  marginBottom: 18,
  color: "#365662"
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12
};

const field = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const label = {
  color: "#254851",
  fontSize: 13,
  fontWeight: 600
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "fit-content",
  marginTop: 12,
  padding: 12,
  background: "#203a43",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const msgStyle = {
  marginTop: 10,
  color: "#20444f"
};
