import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <div style={{ background: "#1976d2", padding: 10, color: "white" }}>
      Offline Telemedicine
    </div>
  );
}
