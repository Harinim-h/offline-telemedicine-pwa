import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function PatientList() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={container}>
      <h3 style={title}>{t("patient_list")}</h3>

      {patients.length === 0 ? (
        <p style={empty}>{t("no_patients")}</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>{t("name")}</th>
                <th style={th}>{t("age")}</th>
                <th style={th}>{t("condition")}</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p, index) => (
                <tr key={p.id}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.age}</td>
                  <td style={td}>{p.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientList;

/* ---------- Styles ---------- */

const container = {
  padding: 10
};

const title = {
  marginBottom: 14,
  color: "#203a43"
};

const empty = {
  opacity: 0.7
};

/* ✅ NEW: Scroll container */
const tableWrap = {
  maxHeight: "55vh",
  overflowY: "auto",
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff"
};

const th = {
  position: "sticky",     // 👈 header always visible
  top: 0,
  background: "#203a43",
  color: "#ffffff",
  padding: 12,
  textAlign: "left",
  zIndex: 1
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e0e0e0"
};
