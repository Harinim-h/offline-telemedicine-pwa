import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Patient Records</h2>

      {patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
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
      )}
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 16
};

export default PatientList;
