import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const role = sessionStorage.getItem("role");

  // ❌ Hide navbar on login
  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <header style={styles.header}>
      <div style={styles.logo}>TeleCare</div>

      <nav style={styles.nav}>
        {role === "patient" && (
          <>
            <NavItem to="/home" label="Home" />
            <NavItem to="/appointments" label="Appointments" />
            <NavItem to="/symptoms" label="Symptoms" />
            <NavItem to="/tips" label="Health Tips" />
            <NavItem to="/consult" label="Consultation" />
            <NavItem to="/doctors" label="Doctor Availability" />
            <NavItem to="/profile" label="Profile" />
          </>
        )}

        {role === "doctor" && (
          <>
            <NavItem to="/home" label="Home" />
            <NavItem to="/appointments" label="Appointments" />
            <NavItem to="/pharmacy" label="Pharmacy" />
            <NavItem to="/consult" label="Consultation" />
          </>
        )}

        {role === "admin" && (
          <>
            <NavItem to="/home" label="Dashboard" />
            <NavItem to="/appointments" label="Appointments" />
            <NavItem to="/users" label="Users" />
            <NavItem to="/settings" label="Settings" />
          </>
        )}
      </nav>
    </header>
  );
}

function NavItem({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        ...styles.link,
        background: active
          ? "rgba(255,255,255,0.35)"
          : "rgba(255,255,255,0.15)",
        fontWeight: active ? "600" : "400",
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "60px",
    background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  },
  logo: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  nav: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "13px",
    padding: "6px 12px",
    borderRadius: "16px",
    transition: "0.2s",
  },
};
