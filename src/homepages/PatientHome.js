import React from "react";

export default function PatientHome() {
  const user = JSON.parse(sessionStorage.getItem("userData"));

  return (
    <div style={page}>
      <h2 style={title}>Welcome, {user?.name || "Patient"} 👋</h2>

      <div style={grid}>
        <Card title="📅 Book Appointment" desc="Schedule doctor visit" />
        <Card title="🩺 Symptom Checker" desc="Check health symptoms" />
        <Card title="💬 Consultation" desc="Online consultation" />
        <Card title="👨‍⚕️ Doctors" desc="Available doctors" />
      </div>

      <Section title="Your Appointments">
        <ListItem text="12 Feb 2026 | 10:30 AM | Dr. Kumar" />
        <ListItem text="18 Feb 2026 | 04:00 PM | Dr. Anjali" />
      </Section>

      <Section title="Health Tips">
        <ListItem text="💧 Drink plenty of water daily" />
        <ListItem text="🚶 Walk 30 minutes every day" />
      </Section>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

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

/* ---------- Styles (Teal + Dark Theme) ---------- */

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
