import React from "react";
import { useTranslation } from "react-i18next";

export default function AdminHome() {
  const { t } = useTranslation();

  return (
    <div style={page}>
      <h2 style={title}>
        {t("admin_dashboard")} 
      </h2>

      <div style={grid}>
        <Card
          title={t("admin_users_title")}
          desc={t("admin_users_desc")}
        />
        <Card
          title={t("admin_appointments_title")}
          desc={t("admin_appointments_desc")}
        />
        <Card
          title={t("admin_doctors_title")}
          desc={t("admin_doctors_desc")}
        />
        <Card
          title={t("admin_settings_title")}
          desc={t("admin_settings_desc")}
        />
      </div>

      <Section title={t("system_overview")}>
        <ListItem text={` ${t("total_patients")}: 128`} />
        <ListItem text={` ${t("total_doctors")}: 14`} />
        <ListItem text={` ${t("appointments_today")}: 22`} />
      </Section>

      <Section title={t("admin_actions")}>
        <ListItem text={`✔ ${t("approve_doctors")}`} />
        <ListItem text={`✔ ${t("monitor_logs")}`} />
        <ListItem text={`✔ ${t("update_guidelines")}`} />
      </Section>
    </div>
  );
}

/* ---------- Components ---------- */

function Card({ title, desc }) {
  return (
    <div style={card}>
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

/* ---------- Styles (UNCHANGED) ---------- */

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
