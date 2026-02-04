import { Navigate } from "react-router-dom";

export default function Home() {
  const role = sessionStorage.getItem("role");

  if (!role) return <Navigate to="/login" replace />;

  if (role === "patient") return <Navigate to="/patient-home" replace />;
  if (role === "doctor") return <Navigate to="/doctor-home" replace />;
  if (role === "admin") return <Navigate to="/admin-home" replace />;

  return <Navigate to="/login" replace />;
}
