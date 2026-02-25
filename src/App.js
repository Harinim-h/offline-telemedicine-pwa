import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddPatient from "./pages/AddPatient";
import DoctorPatients from "./pages/DoctorPatients";
import PharmacyAvailability from "./pages/PharmacyAvailability";
import Consultation from "./pages/Consultation";
import Appointments from "./pages/Appointments";
import Chat from "./pages/Chat";
import PatientHome from "./homepages/PatientHome";
import DoctorHome from "./homepages/DoctorHome";
import AdminHome from "./homepages/AdminHome";

function App() {
  const location = useLocation();

  // Hide navbar on login page
  const hideNavbar = location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />} />

        <Route path="/doctor/add-patient" element={<AddPatient />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />

        <Route path="/pharmacy" element={<PharmacyAvailability />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/consult" element={<Consultation />} />
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/admin-home" element={<AdminHome />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
