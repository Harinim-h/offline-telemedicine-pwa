import { Navigate } from "react-router-dom";
import PatientDashboard from "../roles/PatientDashboard";
import DoctorDashboard from "../roles/DoctorDashboard";
import AdminDashboard from "../roles/AdminDashboard";

export default function Home() {
  const role = sessionStorage.getItem("role");

  if (!role) return <Navigate to="/" replace />;

  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <PatientDashboard />;
}
