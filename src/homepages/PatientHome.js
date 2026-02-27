import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OfflineSymptomChecker from "../components/OfflineSymptomChecker";

export default function PatientHome() {
  const user = JSON.parse(sessionStorage.getItem("userData"));
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={page}>
      <h2 style={title}>
        {t("welcome")}, {user?.name || t("patient")}
      </h2>

      <div style={grid}>
        <Card
          title={t("book_appointment_title")}
          desc={t("book_appointment_desc")}
          onClick={() => navigate("/appointments")}
        />
        <Card
          title={t("symptom_checker_title")}
          desc={t("symptom_checker_desc")}
          onClick={() => navigate("/symptoms")}
        />
        <Card
          title={t("consultation_title")}
          desc={t("consultation_desc")}
          onClick={() => navigate("/consult")}
        />
        <Card
          title={t("doctors_title")}
          desc={t("doctors_desc")}
          onClick={() => navigate("/appointments")}
        />
      </div>

      <Section title={t("your_appointments")}>
        <ListItem text={t("appointment_1")} />
        <ListItem text={t("appointment_2")} />
      </Section>

      <Section title={t("health_tips")}>
        <ListItem text={t("health_tip_1")} />
        <ListItem text={t("health_tip_2")} />
      </Section>

      <Section title="Offline Symptom Checker AI">
        <OfflineSymptomChecker />
      </Section>
    </div>
  );
}

function Card({ title, desc, onClick }) {
  return (
    <div style={card} onClick={onClick}>
      <h4>{title}</h4>
      <p style={{ opacity: 0.85 }}>{desc}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function ListItem({ text }) {
  return <div style={listItem}>{text}</div>;
}

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
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  cursor: "pointer"
};

const sectionTitle = {
  color: "#203a43",
  marginBottom: 10
};

const listItem = {
  background: "#ffffff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};
