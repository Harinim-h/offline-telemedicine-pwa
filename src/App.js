import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddPatient from "./pages/AddPatient";
import DoctorPatients from "./pages/DoctorPatients";
import PatientHome from "./homepages/PatientHome";
import DoctorHome from "./homepages/DoctorHome";
import AdminHome from "./homepages/AdminHome";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />} />

<Route path="/doctor/add-patient" element={<AddPatient />} />
<Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/admin-home" element={<AdminHome />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
