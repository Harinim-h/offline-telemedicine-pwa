import React from "react";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Offline Telemedicine App</h1>
      <PatientForm />
      <PatientList />
    </div>
  );
}

export default App;
