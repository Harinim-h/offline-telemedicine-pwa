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
import Symptoms from "./pages/Symptoms";
import Profile from "./pages/Profile";
import DoctorAvailability from "./pages/DoctorAvailability";
import PatientHome from "./homepages/PatientHome";
import DoctorHome from "./homepages/DoctorHome";
import AdminHome from "./homepages/AdminHome";
import DoctorAnalytics from "./pages/DoctorAnalytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import VoiceNavigator from "./components/VoiceNavigator";

function App() {
  const location = useLocation();
  const role = sessionStorage.getItem("role");

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
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/doctor-availability" element={<DoctorAvailability />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/consult" element={<Consultation />} />
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/doctor-analytics" element={<DoctorAnalytics />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      {!hideNavbar && role === "patient" && <VoiceNavigator />}
    </>
  );
}

export default App;
