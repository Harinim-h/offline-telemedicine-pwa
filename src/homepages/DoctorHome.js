import React, { useState } from "react";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";

export default function DoctorHome() {
  const [showAdd, setShowAdd] = useState(false);
  const [showList, setShowList] = useState(false);

  return (
    <div style={page}>
      <h2 style={title}>Welcome Doctor 👨‍⚕️</h2>

      {/* Shortcut Cards */}
      <div style={grid}>
        <div style={card} onClick={() => setShowAdd(true)}>
          <h4>➕ Add Patient</h4>
          <p>Add new patient details</p>
        </div>

        <div style={card} onClick={() => setShowList(true)}>
          <h4>📋 View Patients</h4>
          <p>See all patient records</p>
        </div>

        <div style={card}>
          <h4>📅 Appointments</h4>
          <p>Today’s scheduled visits</p>
        </div>

        <div style={card}>
          <h4>🧾 Prescriptions</h4>
          <p>Manage prescriptions</p>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <PatientForm onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Patient List Modal */}
      {showList && (
        <Modal onClose={() => setShowList(false)}>
          <PatientList />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ children, onClose }) {
  return (
    <div style={overlay}>
      <div style={modal}>
        <button style={closeBtn} onClick={onClose}>✖</button>
        {children}
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

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modal = {
  background: "#ffffff",
  borderRadius: 14,
  width: "90%",
  maxWidth: "600px",
  padding: 20,
  position: "relative"
};

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 14,
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer"
};
