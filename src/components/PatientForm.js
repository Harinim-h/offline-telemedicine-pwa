// src/components/PatientForm.js
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function PatientForm() {
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
        createdAt: new Date()
      });
      setMessage("Patient added successfully ✅");
      setName("");
      setAge("");
      setCondition("");
    } catch (err) {
      console.error("Firestore error", err);
      setMessage("Error adding patient ❌");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Add Patient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit" style={{ width: "100%" }}>Add Patient</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default PatientForm;
