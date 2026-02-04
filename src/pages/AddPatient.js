import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function AddPatient() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "patients"), {
        name,
        age,
        condition,
        createdAt: new Date()
      });

      setMsg("Patient added successfully ✅");
      setTimeout(() => navigate("/doctor/patients"), 1000);
    } catch {
      setMsg("Error adding patient ❌");
    }
  };

  return (
    <div style={page}>
      <h2 style={title}>Add Patient</h2>

      <form onSubmit={handleSubmit} style={card}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={input} />
        <input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} style={input} />
        <input placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} style={input} />
        <button style={btn}>Save Patient</button>
        {msg && <p>{msg}</p>}
      </form>
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

const card = {
  background: "#fff",
  padding: 24,
  maxWidth: 400,
  margin: "auto",
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#203a43",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};
