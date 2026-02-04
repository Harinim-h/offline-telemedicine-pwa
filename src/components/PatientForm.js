import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function PatientForm({ onClose }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !age || !condition) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "patients"), {
        name,
        age,
        condition,
        createdAt: serverTimestamp()
      });

      setMessage("Patient added successfully ✅");
      setName("");
      setAge("");
      setCondition("");

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage("Error adding patient ❌");
    }
  };

  return (
    <div>
      <h2>Add Patient</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={input}
        />

        <input
          placeholder="Medical Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={input}
        />

        <button type="submit" style={btn}>Save Patient</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#203a43",
  color: "#fff",
  cursor: "pointer"
};

export default PatientForm;
