import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SpeakableText from "../components/SpeakableText";

function getCardSpeakText(label, description) {
  const cleanLabel = String(label || "").trim();
  const cleanDescription = String(description || "").trim();

  if (!cleanDescription) return cleanLabel;

  const labelLower = cleanLabel.toLowerCase();
  const descriptionLower = cleanDescription.toLowerCase();

  if (descriptionLower === labelLower) {
    return cleanDescription;
  }

  if (descriptionLower.startsWith(`${labelLower}.`)) {
    return cleanDescription.slice(cleanLabel.length + 1).trim();
  }

  if (descriptionLower.startsWith(`${labelLower} `)) {
    return cleanDescription.slice(cleanLabel.length).trim();
  }

  return cleanDescription;
}

export default function PatientHome() {
  const user = JSON.parse(sessionStorage.getItem("userData"));
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: "📅",
      label: t("nav.appointments"),
      description: t("book_appointment_desc"),
      route: "/appointments"
    },
    {
      icon: "🩺",
      label: t("nav.symptoms"),
      description: t("symptom_checker_desc"),
      route: "/symptoms"
    },
    {
      icon: "🎥",
      label: t("nav.consultation"),
      description: t("consultation_desc"),
      route: "/consult"
    },
    {
      icon: "👨‍⚕️",
      label: t("nav.doctors"),
      description: t("doctors_desc"),
      route: "/doctor-availability"
    },
    {
      icon: "👤",
      label: t("nav.profile"),
      description: t("profile_title"),
      route: "/profile"
    }
  ];

  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={`${t("welcome")}, ${user?.name || t("patient")}`}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 6 }}
      />
      <SpeakableText
        as="p"
        text={t("patient_home_hint")}
        style={hint}
        wrapperStyle={{ display: "flex", marginBottom: 20 }}
      />

      <div style={actionGrid}>
        {quickActions.map((item) => (
          <div key={item.route} style={actionCard}>
            <button
              type="button"
              onClick={() => navigate(item.route)}
              style={actionButton}
              aria-label={`${item.label}. ${getCardSpeakText(item.label, item.description)}`}
            >
              <span style={actionIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span style={actionLabel}>{item.label}</span>
            </button>
            <SpeakableText
              text={getCardSpeakText(item.label, item.description)}
              wrapperStyle={actionSpeakWrap}
              buttonStyle={actionSpeakButton}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const page = {
  padding: 18,
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #dff7f3 0%, #e6f7ff 42%, #eef2ff 100%)"
};

const title = {
  color: "#0f2027",
  marginBottom: 6,
  fontSize: 34
};

const hint = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 20,
  color: "#164e63",
  fontWeight: 600
};

const actionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14
};

const actionCard = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 8
};

const actionButton = {
  color: "#1b1b1b",
  border: "1px solid #d3dde2",
  borderRadius: 22,
  minHeight: 170,
  width: "100%",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  boxShadow: "0 8px 14px rgba(0,0,0,0.1)",
  cursor: "pointer",
  padding: 16,
  textAlign: "center"
};

const actionIcon = {
  width: 62,
  height: 62,
  borderRadius: 999,
  border: "2px solid #9bb2bf",
  display: "grid",
  placeItems: "center",
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1
};

const actionLabel = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: 0.3,
  textAlign: "center"
};

const actionSpeakWrap = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d3dde2",
  borderRadius: 14,
  padding: "8px 10px"
};

const actionSpeakButton = {
  width: 38,
  height: 38,
  fontSize: 16,
  flexShrink: 0
};
