import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";

export default function DoctorHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [showList, setShowList] = useState(false);

  return (
    <div style={page}>
      <h2 style={title}>{t("welcome_doctor")} </h2>

      {/* Shortcut Cards */}
      <div style={grid}>
        <div style={card} onClick={() => setShowAdd(true)}>
          <h4>{t("add_patient_title")}</h4>
          <p>{t("add_patient_desc")}</p>
        </div>

        <div style={card} onClick={() => setShowList(true)}>
          <h4>{t("view_patients_title")}</h4>
          <p>{t("view_patients_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/appointments")}>
          <h4>{t("appointments_title")}</h4>
          <p>{t("appointments_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/consult")}>
          <h4>{t("video_call_card_title")}</h4>
          <p>{t("video_call_card_desc")}</p>
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
  const { t } = useTranslation();
  return (
    <div style={overlay}>
      <div style={modal}>
        <button style={closeBtn} onClick={onClose}>
          {t("close")}
        </button>
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
