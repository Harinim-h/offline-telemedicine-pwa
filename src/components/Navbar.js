import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const location = useLocation();
  const role = sessionStorage.getItem("role");
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [open, setOpen] = useState(false);

  /* ---------- Screen Resize ---------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ❌ Hide navbar on login
  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <header style={styles.header}>
      <div style={styles.logo}>🩺</div>

      {/* 📱 MOBILE MENU BUTTON */}
      {isMobile && (
        <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
          ☰
        </button>
      )}

      {/* 💻 DESKTOP NAV */}
      {!isMobile && (
        <nav style={styles.nav}>
          <MenuLinks role={role} t={t} />
        </nav>
      )}

      {/* 📱 MOBILE NAV */}
      {isMobile && open && (
        <div style={styles.mobileMenu}>
          <MenuLinks
            role={role}
            t={t}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </header>
  );
}

/* ---------- MENU LINKS ---------- */

function MenuLinks({ role, t, onClick }) {
  return (
    <>
      {role === "patient" && (
        <>
          <NavItem to="/home" label={t("nav.home")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/symptoms" label={t("nav.symptoms")} onClick={onClick} />
          <NavItem to="/tips" label={t("nav.health_tips")} onClick={onClick} />
          <NavItem to="/consult" label={t("nav.consultation")} onClick={onClick} />
          <NavItem to="/doctors" label={t("nav.doctors")} onClick={onClick} />
          <NavItem to="/profile" label={t("nav.profile")} onClick={onClick} />
        </>
      )}

      {role === "doctor" && (
        <>
          <NavItem to="/doctor-home" label={t("nav.dashboard")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
          <NavItem to="/consult" label={t("nav.consultation")} onClick={onClick} />
        </>
      )}

      {role === "admin" && (
        <>
          <NavItem to="/admin-home" label={t("nav.dashboard")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/users" label={t("nav.users")} onClick={onClick} />
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
          <NavItem to="/settings" label={t("nav.settings")} onClick={onClick} />
        </>
      )}

      {role === "pharmacy" && (
        <>
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
        </>
      )}
    </>
  );
}

/* ---------- NAV ITEM ---------- */

function NavItem({ to, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        ...styles.link,
        background: active
          ? "rgba(255,255,255,0.35)"
          : "rgba(255,255,255,0.15)",
        fontWeight: active ? "600" : "400"
      }}
    >
      {label}
    </Link>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff"
  },

  logo: {
    fontSize: 18,
    fontWeight: 700
  },

  nav: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 13,
    padding: "6px 12px",
    borderRadius: 16
  },

  /* 📱 Mobile */
  menuBtn: {
    fontSize: 22,
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer"
  },

  mobileMenu: {
    position: "absolute",
    top: "60px",
    left: 0,
    right: 0,
    background: "linear-gradient(180deg, #203a43, #2c5364)",
    display: "flex",
    flexDirection: "column",
    padding: 12,
    gap: 8
  }
};
