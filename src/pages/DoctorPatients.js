import React, { useEffect, useState } from "react";
import { getAllPatientRecordsCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!hasSupabase || !navigator.onLine) {
        setPatients([]);
        return;
      }
      const data = await getAllPatientRecordsCloud();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  return (
    <div style={page}>
      <h2 style={title}>Patient Records</h2>

      <table style={table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

const table = {
  width: "100%",
  background: "#fff",
  borderCollapse: "collapse",
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
};
