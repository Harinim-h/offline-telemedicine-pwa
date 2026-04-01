import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function DoctorHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={page}>
      <h2 style={title}>{t("welcome_doctor")} </h2>

      {/* Shortcut Cards */}
      <div style={grid}>
        <div style={card} onClick={() => navigate("/doctor/add-patient")}>
          <h4>{t("add_patient_title")}</h4>
          <p>{t("add_patient_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/appointments")}>
          <h4>{t("appointments_title")}</h4>
          <p>{t("appointments_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/doctor/patients")}>
          <h4>{t("view_patients_title")}</h4>
          <p>{t("view_patients_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/pharmacy")}>
          <h4>{t("pharmacy")}</h4>
          <p>{t("pharmacy_title")}</p>
        </div>

        <div style={card} onClick={() => navigate("/doctor-analytics")}>
          <h4>{t("home_analytics_title")}</h4>
          <p>{t("home_analytics_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/consult")}>
          <h4>{t("video_call_card_title")}</h4>
          <p>{t("video_call_card_desc")}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 20
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16
};

const card = {
  background: "linear-gradient(135deg, #203a43, #2c5364)",
  color: "#ffffff",
  padding: 22,
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  cursor: "pointer"
};
