import React from "react";
import OfflineSymptomChecker from "../components/OfflineSymptomChecker";

export default function Symptoms() {
  return (
    <div style={page}>
      <h2 style={title}>Symptom Checker</h2>
      <OfflineSymptomChecker />
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  marginTop: 0,
  color: "#0f2027",
  marginBottom: 14
};
