import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { i18n } = useTranslation(); // ensures language is initialized
  const role = sessionStorage.getItem("role");

  // 🔁 Load saved language on refresh
  const savedLang = localStorage.getItem("language");
  if (savedLang && i18n.language !== savedLang) {
    i18n.changeLanguage(savedLang);
  }

  // 🔐 Not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // 🎯 Role-based redirection
  if (role === "patient") {
    return <Navigate to="/patient-home" replace />;
  }

  if (role === "doctor") {
    return <Navigate to="/doctor-home" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin-home" replace />;
  }

  // ❌ Fallback
  return <Navigate to="/login" replace />;
}
