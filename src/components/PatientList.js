// src/components/PatientList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Patient List</h2>
      {patients.length === 0 && <p>No patients yet</p>}
      <ul>
        {patients.map((p) => (
          <li key={p.id} style={{ marginBottom: "10px" }}>
            <strong>{p.name}</strong> | Age: {p.age} | Condition: {p.condition}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;
