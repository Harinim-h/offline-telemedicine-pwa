import React from "react";

export default function AdminHome() {
  return (
    <div style={page}>
      <h2 style={title}>Admin Dashboard 🛠️</h2>

      <div style={grid}>
        <Card title="👥 Users" desc="Manage patients & doctors" />
        <Card title="📅 Appointments" desc="All booked appointments" />
        <Card title="🏥 Doctors" desc="Doctor availability & profiles" />
        <Card title="⚙️ Settings" desc="System configuration" />
      </div>

      <Section title="System Overview">
        <ListItem text="👤 Total Patients: 128" />
        <ListItem text="👨‍⚕️ Total Doctors: 14" />
        <ListItem text="📅 Appointments Today: 22" />
      </Section>

      <Section title="Admin Actions">
        <ListItem text="✔ Approve new doctors" />
        <ListItem text="✔ Monitor appointment logs" />
        <ListItem text="✔ Update health guidelines" />
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
